"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/session";
import { apiFetch, ApiError } from "@/lib/api";
import type { CoreJourneyEntry, JourneyEntryRequest } from "@/lib/types";

// Same reason as public-team-actions.ts: same-origin Server Actions around
// zenyukti-os's CORS-less API. ZenYukti Journey is Founder/admin-controlled
// — GET/POST /v1/users/{id}/journey and PATCH/DELETE
// /v1/users/{id}/journey/{entry_id}, all gated by permission
// "journey.manage" (see journey.go) — the backend re-checks this on every
// request regardless of what the frontend shows.
export type JourneyActionResult =
  | { ok: true; entry: CoreJourneyEntry }
  | { ok: false; error: string };

export type DeleteJourneyEntryResult =
  | { ok: true }
  | { ok: false; error: string };

function revalidateMember(userId: string) {
  revalidatePath(`/members/${userId}`);
}

export async function createJourneyEntry(
  userId: string,
  payload: JourneyEntryRequest,
): Promise<JourneyActionResult> {
  const session = await requireSession();
  try {
    const entry = await apiFetch<CoreJourneyEntry>(
      `/v1/users/${userId}/journey`,
      session.access_token,
      { method: "POST", body: JSON.stringify(payload) },
    );
    revalidateMember(userId);
    return { ok: true, entry };
  } catch (err) {
    return {
      ok: false,
      error:
        err instanceof ApiError
          ? err.detail || err.message
          : "Failed to add journey entry.",
    };
  }
}

export async function updateJourneyEntry(
  userId: string,
  entryId: string,
  payload: JourneyEntryRequest,
): Promise<JourneyActionResult> {
  const session = await requireSession();
  try {
    const entry = await apiFetch<CoreJourneyEntry>(
      `/v1/users/${userId}/journey/${entryId}`,
      session.access_token,
      { method: "PATCH", body: JSON.stringify(payload) },
    );
    revalidateMember(userId);
    return { ok: true, entry };
  } catch (err) {
    return {
      ok: false,
      error:
        err instanceof ApiError
          ? err.detail || err.message
          : "Failed to save journey entry.",
    };
  }
}

export async function deleteJourneyEntry(
  userId: string,
  entryId: string,
): Promise<DeleteJourneyEntryResult> {
  const session = await requireSession();
  try {
    await apiFetch<void>(
      `/v1/users/${userId}/journey/${entryId}`,
      session.access_token,
      { method: "DELETE" },
    );
    revalidateMember(userId);
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error:
        err instanceof ApiError
          ? err.detail || err.message
          : "Failed to remove journey entry.",
    };
  }
}
