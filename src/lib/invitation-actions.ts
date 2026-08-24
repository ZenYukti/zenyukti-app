"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/session";
import { apiFetch, ApiError } from "@/lib/api";
import type { CoreInvitation } from "@/lib/types";

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
