/**
 * Core API (api.zenyukti.in) response shapes.
 *
 * These are inferred from the endpoint/field list in the product spec —
 * zenyukti-os is a private repo and no live token was available while
 * building this, so the exact JSON keys have NOT been verified against a
 * real response. If a page renders blank/missing fields once wired to a
 * real account, check the field names here first against the actual
 * backend response and adjust — this is the one file that should need it.
 */

export type MemberStatus = "active" | "pending" | "suspended" | string;

export interface CoreUser {
  id: string;
  email: string;
  status: MemberStatus;
  created_at?: string;
}

export interface CoreProfile {
  user_id?: string;
  name?: string;
  display_name?: string;
  bio?: string;
  avatar_url?: string;
  title?: string;
  github?: string;
  linkedin?: string;
  website?: string;
  skills?: string[];
  team?: string;
}

export interface CoreRole {
  id?: string;
  name: string;
}

/**
 * GET /v1/users/:id — assumed to return the base user plus nested
 * profile/roles. Not confirmed against a real response; if the detail
 * endpoint turns out to be flat or shaped differently, this is the type
 * to adjust.
 */
export interface CoreUserDetail extends CoreUser {
  profile?: CoreProfile;
  roles?: CoreRole[];
}

export type CorePermission = string;

export interface CoreInvitation {
  id: string;
  email: string;
  role?: string;
  status: "pending" | "accepted" | "revoked" | "expired" | string;
  created_at?: string;
  expires_at?: string;
  invited_by?: string;
}

export interface CoreApiError {
  title?: string;
  status?: number;
  detail?: string;
}
