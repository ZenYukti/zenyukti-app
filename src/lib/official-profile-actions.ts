"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/session";
import { apiFetch, ApiError } from "@/lib/api";
import type {
  SetTitleRequest,
  SetTitleResponse,
  SetMemberSinceRequest,
  SetMemberSinceResponse,
} from "@/lib/types";

// Official ZenYukti profile fields (00027) — Founder/admin-controlled,
// never reachable through the member's own PATCH /v1/me/profile. Both
// gated by permission "profiles.manage" (see official_profile.go); the
// backend re-checks this on every request regardless of what the frontend
// shows. Same-origin Server Actions for the same CORS reason as every
// other *-actions.ts file here.
export type SetTitleResult =
  | { ok: true; title?: string }
  | { ok: false; error: string };

export type SetMemberSinceResult =
  | { ok: true; memberSince?: string }
  | { ok: false; error: string };

export async function setOfficialTitle(
  userId: string,
  payload: SetTitleRequest,
): Promise<SetTitleResult> {
  const session = await requireSession();
  try {
    const res = await apiFetch<SetTitleResponse>(
      `/v1/users/${userId}/title`,
      session.access_token,
      { method: "PATCH", body: JSON.stringify(payload) },
    );
    revalidatePath(`/members/${userId}`);
    return { ok: true, title: res.title };
  } catch (err) {
    return {
      ok: false,
      error:
        err instanceof ApiError
          ? err.detail || err.message
          : "Failed to save official title.",
    };
  }
}

export async function setMemberSince(
  userId: string,
  payload: SetMemberSinceRequest,
): Promise<SetMemberSinceResult> {
  const session = await requireSession();
  try {
    const res = await apiFetch<SetMemberSinceResponse>(
      `/v1/users/${userId}/member-since`,
      session.access_token,
      { method: "PATCH", body: JSON.stringify(payload) },
    );
    revalidatePath(`/members/${userId}`);
    return { ok: true, memberSince: res.member_since };
  } catch (err) {
    return {
      ok: false,
      error:
        err instanceof ApiError
          ? err.detail || err.message
          : "Failed to save Team Member Since.",
    };
  }
}
