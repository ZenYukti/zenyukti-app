"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/session";
import { apiFetch, ApiError } from "@/lib/api";
import type {
  PublicTeamMember,
  UpdatePublicTeamMembershipRequest,
  UpdatePublicTeamMembershipResponse,
} from "@/lib/types";

// Same reason as invitation-actions.ts / profile-actions.ts: a browser-side
// PATCH to api.zenyukti.in is silently blocked by zenyukti-os's missing
// CORS support. Running this as a Server Action makes it same-origin.
//
// Response shape confirmed against zenyukti-os's SetPublicTeamMembership
// handler: always 200, body `{ "public_team_member": { listed, display_order } | null }`.
export type PublicTeamActionResult =
  | { ok: true; publicTeamMember: PublicTeamMember | null }
  | { ok: false; error: string };

export async function updatePublicTeamMembership(
  id: string,
  payload: UpdatePublicTeamMembershipRequest,
): Promise<PublicTeamActionResult> {
  const session = await requireSession();
  try {
    const res = await apiFetch<UpdatePublicTeamMembershipResponse>(
      `/v1/users/${id}/public-team-membership`,
      session.access_token,
      { method: "PATCH", body: JSON.stringify(payload) },
    );
    revalidatePath(`/members/${id}`);
    revalidatePath("/members");
    revalidatePath("/team");
    return { ok: true, publicTeamMember: res.public_team_member };
  } catch (err) {
    return {
      ok: false,
      error:
        err instanceof ApiError
          ? err.detail || err.message
          : "Failed to update public Core Team membership.",
    };
  }
}
