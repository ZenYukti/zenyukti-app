"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/session";
import { apiFetch, ApiError } from "@/lib/api";
import type { CoreInvitation, CoreInvitationLookup } from "@/lib/types";

/**
 * zenyukti-os has no CORS handling (confirmed: an OPTIONS preflight to
 * /v1/invitations gets no Access-Control-Allow-Origin header at all), so a
 * browser-side fetch to api.zenyukti.in is silently blocked before the
 * request ever reaches the server — the client only sees a generic network
 * error, never the real ApiError. Running these as Server Actions makes
 * the call same-origin (browser -> this Next.js server -> Core), which
 * sidesteps CORS entirely and lets the real API error detail surface.
 */
export type InvitationActionResult =
  | { ok: true; invitation: CoreInvitation }
  | { ok: false; error: string };

function toResult(err: unknown, fallback: string): InvitationActionResult {
  return {
    ok: false,
    error: err instanceof ApiError ? err.detail || err.message : fallback,
  };
}

export async function issueInvitation(
  email: string,
): Promise<InvitationActionResult> {
  const session = await requireSession();
  try {
    const invitation = await apiFetch<CoreInvitation>(
      "/v1/invitations",
      session.access_token,
      { method: "POST", body: JSON.stringify({ email }) },
    );
    revalidatePath("/invitations");
    return { ok: true, invitation };
  } catch (err) {
    return toResult(err, "Failed to issue invitation.");
  }
}

export async function revokeInvitation(
  id: string,
): Promise<InvitationActionResult> {
  const session = await requireSession();
  try {
    const invitation = await apiFetch<CoreInvitation>(
      `/v1/invitations/${id}/revoke`,
      session.access_token,
      { method: "POST" },
    );
    revalidatePath("/invitations");
    return { ok: true, invitation };
  } catch (err) {
    return toResult(err, "Failed to revoke invitation.");
  }
}

/**
 * zenyukti-os has no resend/reissue endpoint, but the same result is
 * reachable with existing ones: GetOpenInvitationByEmail (the check Issue
 * uses to reject duplicates) matches rows where
 * `accepted_at IS NULL AND revoked_at IS NULL` — expiry isn't part of that
 * condition, so an EXPIRED invitation still counts as "open" and blocks a
 * new Issue until it's revoked. A REVOKED one already fails that check, so
 * it doesn't need revoking again (and re-revoking it would 409
 * ErrAlreadyClosed). Only valid for revoked/expired invitations — a
 * pending one already has a working link, and an accepted one can't be
 * reissued at all (Issue would 409 ErrAlreadyMember).
 */
export async function reissueInvitation(
  invitation: Pick<CoreInvitation, "id" | "email" | "status">,
): Promise<InvitationActionResult> {
  const session = await requireSession();
  try {
    if (invitation.status.toUpperCase() !== "REVOKED") {
      await apiFetch(
        `/v1/invitations/${invitation.id}/revoke`,
        session.access_token,
        { method: "POST" },
      );
    }
    const reissued = await apiFetch<CoreInvitation>(
      "/v1/invitations",
      session.access_token,
      { method: "POST", body: JSON.stringify({ email: invitation.email }) },
    );
    revalidatePath("/invitations");
    return { ok: true, invitation: reissued };
  } catch (err) {
    return toResult(err, "Failed to reissue invitation.");
  }
}

/**
 * lookupInvitation/acceptInvitation are public — invitees have no session,
 * so requireSession() doesn't apply — but they need the same same-origin
 * fix as the authenticated actions above: the accept page's password POST
 * used to call apiFetch directly from the browser, which zenyukti-os's
 * missing CORS support silently blocked. That's the actual, traced cause
 * of production's generic "Something went wrong" — the request never
 * reached the backend at all, so the real ApiError (detail, status) never
 * had a chance to surface. Routing both through Server Actions fixes that
 * by construction, the same way it already fixed Issue/Revoke/Reissue.
 */
export type InvitationLookupResult =
  | { ok: true; email: string }
  | { ok: false; status?: number; error: string };

export async function lookupInvitation(
  token: string,
): Promise<InvitationLookupResult> {
  try {
    const res = await apiFetch<CoreInvitationLookup>(
      `/v1/invitations/lookup?token=${encodeURIComponent(token)}`,
      null,
    );
    return { ok: true, email: res.email };
  } catch (err) {
    return {
      ok: false,
      status: err instanceof ApiError ? err.status : undefined,
      error:
        err instanceof ApiError
          ? err.detail || err.message
          : "Couldn't look up this invitation.",
    };
  }
}

export async function acceptInvitation(
  token: string,
  password: string,
): Promise<InvitationLookupResult> {
  try {
    const res = await apiFetch<{ id: string; email: string; status: string }>(
      "/v1/invitations/accept",
      null,
      { method: "POST", body: JSON.stringify({ token, password }) },
    );
    return { ok: true, email: res.email };
  } catch (err) {
    return {
      ok: false,
      status: err instanceof ApiError ? err.status : undefined,
      error:
        err instanceof ApiError
          ? err.detail || err.message
          : "Something went wrong. Please try again.",
    };
  }
}
