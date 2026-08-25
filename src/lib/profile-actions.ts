"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/session";
import { apiFetch, ApiError } from "@/lib/api";
import type { CoreProfile, UpdateProfileRequest } from "@/lib/types";

// Same reason as invitation-actions.ts: a browser-side PATCH to
// api.zenyukti.in is silently blocked by zenyukti-os's missing CORS
// support. Running this as a Server Action makes it same-origin.
export type ProfileActionResult =
  | { ok: true; profile: CoreProfile }
  | { ok: false; error: string };

export async function updateProfile(
  payload: UpdateProfileRequest,
): Promise<ProfileActionResult> {
  const session = await requireSession();
  try {
    const profile = await apiFetch<CoreProfile>(
      "/v1/me/profile",
      session.access_token,
      { method: "PATCH", body: JSON.stringify(payload) },
    );
    revalidatePath("/profile");
    revalidatePath("/");
    revalidatePath("/team");
    revalidatePath("/members");
    return { ok: true, profile };
  } catch (err) {
    return {
      ok: false,
      error:
        err instanceof ApiError ? err.detail || err.message : "Failed to save profile.",
    };
  }
}
