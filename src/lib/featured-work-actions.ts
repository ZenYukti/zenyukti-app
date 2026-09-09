"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/session";
import { apiFetch, ApiError } from "@/lib/api";
import type { CoreFeaturedWorkItem, FeaturedWorkRequest } from "@/lib/types";

// Same reason as profile-actions.ts: a browser-side call to
// api.zenyukti.in is silently blocked by zenyukti-os's missing CORS
// support. Running these as Server Actions makes them same-origin.
// Self-service — GET/POST/PATCH/DELETE /v1/me/featured-work(/{id}) — every
// entry is scoped to the caller's own rows by the query itself, not just
// permission (see identity.Handler's featured_work.go).
export type FeaturedWorkActionResult =
  | { ok: true; item: CoreFeaturedWorkItem }
  | { ok: false; error: string };

export type DeleteFeaturedWorkResult =
  | { ok: true }
  | { ok: false; error: string };

// /u/[username] fetches with cache: "no-store" (see src/lib/api.ts), so it
// re-reads fresh on every request already — only /profile itself needs
// revalidating here.
function revalidateProfile() {
  revalidatePath("/profile");
}

export async function createFeaturedWork(
  payload: FeaturedWorkRequest,
): Promise<FeaturedWorkActionResult> {
  const session = await requireSession();
  try {
    const item = await apiFetch<CoreFeaturedWorkItem>(
      "/v1/me/featured-work",
      session.access_token,
      { method: "POST", body: JSON.stringify(payload) },
    );
    revalidateProfile();
    return { ok: true, item };
  } catch (err) {
    return {
      ok: false,
      error:
        err instanceof ApiError
          ? err.detail || err.message
          : "Failed to add featured work.",
    };
  }
}

export async function updateFeaturedWork(
  id: string,
  payload: FeaturedWorkRequest,
): Promise<FeaturedWorkActionResult> {
  const session = await requireSession();
  try {
    const item = await apiFetch<CoreFeaturedWorkItem>(
      `/v1/me/featured-work/${id}`,
      session.access_token,
      { method: "PATCH", body: JSON.stringify(payload) },
    );
    revalidateProfile();
    return { ok: true, item };
  } catch (err) {
    return {
      ok: false,
      error:
        err instanceof ApiError
          ? err.detail || err.message
          : "Failed to save featured work.",
    };
  }
}

export async function deleteFeaturedWork(
  id: string,
): Promise<DeleteFeaturedWorkResult> {
  const session = await requireSession();
  try {
    await apiFetch<void>(`/v1/me/featured-work/${id}`, session.access_token, {
      method: "DELETE",
    });
    revalidateProfile();
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error:
        err instanceof ApiError
          ? err.detail || err.message
          : "Failed to remove featured work.",
    };
  }
}
