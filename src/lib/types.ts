/**
 * Core API (api.zenyukti.in) response shapes.
 *
 * Verified directly against zenyukti-os's handlers (internal/modules/*),
 * not guessed from the product spec.
 */

export type MemberStatus = "INVITED" | "ACTIVE" | "SUSPENDED" | "DISABLED" | string;

/** GET /v1/me. */
export interface CoreUser {
  id: string;
  email: string;
  status: MemberStatus;
  created_at: string;
}

/**
 * The socials JSONB column is opaque to the backend — it stores and
 * returns whatever object shape is sent, without validating specific
 * keys (see identity.Handler.UpdateProfile). This is the shape the
 * frontend has standardized on.
 */
export interface ProfileSocials {
  github?: string;
  linkedin?: string;
  x?: string;
  instagram?: string;
  website?: string;
}

/** GET/PATCH /v1/me/profile. 404 on GET if no profile row exists yet. */
export interface CoreProfile {
  display_name: string;
  username?: string;
  avatar_url?: string;
  bio?: string;
  title?: string;
  socials: ProfileSocials;
  skills: string[];
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

/** PATCH /v1/me/profile request body — display_name is required (NOT NULL column). */
export interface UpdateProfileRequest {
  display_name: string;
  username?: string;
  avatar_url?: string;
  bio?: string;
  title?: string;
  socials: ProfileSocials;
  skills: string[];
  is_public: boolean;
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
 * Another member's profile as visible on GET /v1/users and
 * /v1/users/:id — only ever present when that member set is_public=true
 * on their own profile. Deliberately narrower than CoreProfile: no
 * username/is_public/created_at/updated_at, which are the owner's own
 * business (see members.memberProfileResponse).
 */
export interface CoreMemberProfile {
  display_name: string;
  avatar_url?: string;
  title?: string;
  bio?: string;
  socials: ProfileSocials;
  skills: string[];
}

/** GET /v1/users and GET /v1/users/:id. */
export interface CoreMember {
  id: string;
  email: string;
  status: MemberStatus;
  standing_role?: string | null;
  created_at: string;
  disabled_at?: string | null;
  profile?: CoreMemberProfile | null;
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

/** GET /v1/invitations/lookup?token=... — public, no auth required. */
export interface CoreInvitationLookup {
  email: string;
}

/**
 * GET /v1/profiles/u/{username} — public, no auth required. Backs
 * app.zenyukti.in/u/<username>. Deliberately narrower than CoreProfile: no
 * id/email/status/is_public/timestamps — the backend never returns those
 * here at all (see publicprofiles.Handler.Get).
 */
export interface CorePublicProfile {
  username: string;
  display_name: string;
  avatar_url?: string;
  title?: string;
  bio?: string;
  skills: string[];
  socials: ProfileSocials;
}

export interface CoreApiError {
  title?: string;
  status?: number;
  detail?: string;
}
