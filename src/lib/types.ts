/**
 * Core API (api.zenyukti.in) response shapes.
 *
 * Verified directly against zenyukti-os's handlers (internal/modules/*),
 * not guessed from the product spec. CoreProfile is the one exception —
 * self-profile editing is out of scope for this pass, so it's left as-is.
 */

export type MemberStatus = "INVITED" | "ACTIVE" | "SUSPENDED" | "DISABLED" | string;

/** GET /v1/me. */
export interface CoreUser {
  id: string;
  email: string;
  status: MemberStatus;
  created_at: string;
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

/** GET /v1/me/roles — one of the caller's currently-effective role grants. */
export interface CoreRole {
  slug: string;
  name: string;
}

export interface CoreRolesResponse {
  roles: CoreRole[];
}

/**
 * GET /v1/users and GET /v1/users/:id — no nested `profile` exists for
 * other users on the real API (only /v1/me/profile returns profile data,
 * and only for the caller's own account).
 */
export interface CoreMember {
  id: string;
  email: string;
  status: MemberStatus;
  standing_role?: string | null;
  created_at: string;
  disabled_at?: string | null;
}

export interface CoreMembersResponse {
  members: CoreMember[];
}

/** One role grant as returned in GET /v1/users/:id's `roles` array. */
export interface CoreMemberRole {
  slug: string;
  kind: string;
  scope_type: string;
  scope_id?: string | null;
}

export interface CoreMemberDetail extends CoreMember {
  roles: CoreMemberRole[];
}

export interface CorePermission {
  resource: string;
  action: string;
  scope_type: string;
  scope_id?: string | null;
}

export interface CorePermissionsResponse {
  permissions: CorePermission[];
}

/** GET /v1/invitations, POST /v1/invitations, POST /v1/invitations/:id/revoke. */
export interface CoreInvitation {
  id: string;
  email: string;
  status: "PENDING" | "ACCEPTED" | "REVOKED" | "EXPIRED" | string;
  invited_by: string;
  expires_at: string;
  created_at: string;
  accepted_at?: string | null;
  revoked_at?: string | null;
  accept_url?: string;
}

export interface CoreInvitationsResponse {
  invitations: CoreInvitation[];
}

export interface CoreApiError {
  title?: string;
  status?: number;
  detail?: string;
}
