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

/**
 * GET/PATCH /v1/me/profile. 404 on GET if no profile row exists yet.
 * `title` and `member_since` are read-only here (2026-09-09 ownership-model
 * correction, migration 00027): the caller can see their own official title
 * and ZenYukti membership-start date, but PATCH no longer accepts either —
 * see UpdateProfileRequest. The only write paths are
 * PATCH /v1/users/{id}/title and PATCH /v1/users/{id}/member-since
 * (profiles.manage, Founder-only) — see official-profile-actions.ts.
 */
export interface CoreProfile {
  display_name: string;
  username?: string;
  avatar_url?: string;
  banner_url?: string;
  bio?: string;
  title?: string;
  socials: ProfileSocials;
  skills: string[];
  is_public: boolean;
  quote?: string;
  location?: string;
  availability?: string;
  focus_areas: string[];
  interests: string[];
  member_since?: string;
  created_at: string;
  updated_at: string;
}

/**
 * PATCH /v1/me/profile request body — display_name is required (NOT NULL
 * column). No `title`/`member_since` field: both are ZenYukti-controlled
 * and the backend physically has no write path for either here (see
 * CoreProfile's doc comment) — sending them would just be silently
 * ignored, so the type doesn't offer them at all.
 */
export interface UpdateProfileRequest {
  display_name: string;
  username?: string;
  avatar_url?: string;
  banner_url?: string | null;
  bio?: string;
  socials: ProfileSocials;
  skills: string[];
  is_public: boolean;
  quote?: string;
  location?: string;
  availability?: string;
  focus_areas: string[];
  interests: string[];
}

/**
 * One of the caller's own Featured Work entries —
 * GET/POST/PATCH/DELETE /v1/me/featured-work(/{id}), self-service (owned
 * by user_id, enforced by the query itself, not just permission). Unlike
 * the public ProfileFeaturedWorkItem, this includes id/is_public/
 * timestamps since the owner needs them to manage their own entries.
 */
export interface CoreFeaturedWorkItem {
  id: string;
  title: string;
  description?: string;
  url?: string;
  image_url?: string;
  tags: string[];
  date?: string;
  display_order: number;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

/** POST/PATCH /v1/me/featured-work(/{id}) request body — only title is required. */
export interface FeaturedWorkRequest {
  title: string;
  description?: string;
  url?: string;
  image_url?: string;
  tags: string[];
  date?: string;
  display_order: number;
  is_public?: boolean;
}

/**
 * GET /v1/users/{id}/journey — the Founder/admin editing view (published
 * and draft entries alike). Distinct from the public
 * ProfileJourneyEntry: this includes id/is_published/timestamps, which the
 * editing UI needs but the public ZenCard never sees. Deliberately no
 * created_by — see journey.go's doc comment.
 */
export interface CoreJourneyEntry {
  id: string;
  title: string;
  description?: string;
  date?: string;
  icon?: string;
  display_order: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

/** POST/PATCH /v1/users/{id}/journey(/{entry_id}) request body. */
export interface JourneyEntryRequest {
  title: string;
  description?: string;
  date?: string;
  icon?: string;
  display_order: number;
  is_published?: boolean;
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

/**
 * Public Core Team roster membership, as returned on GET /v1/users and
 * /v1/users/:id — `null` when the member isn't on the public roster.
 * Deliberately separate from standing_role: the backend keeps
 * Founder/ZenCrew/ZenMate completely independent of public Core Team
 * listing, so this is never derived from it.
 */
export interface PublicTeamMember {
  listed: boolean;
  display_order: number;
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
  public_team_member?: PublicTeamMember | null;
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

/**
 * PATCH /v1/users/:id/public-team-membership request body. `display_order`
 * is only meaningful (and only sent) when adding/updating a listing —
 * removing one is `{ listed: false }` with no order.
 */
export interface UpdatePublicTeamMembershipRequest {
  listed: boolean;
  display_order?: number;
}

/**
 * PATCH /v1/users/:id/public-team-membership response body — confirmed
 * against zenyukti-os's SetPublicTeamMembership handler. Always 200, with
 * `public_team_member` set to the persisted { listed, display_order } on
 * add/update, or `null` after a removal.
 */
export interface UpdatePublicTeamMembershipResponse {
  public_team_member: PublicTeamMember | null;
}

/**
 * PATCH /v1/users/{id}/title request/response — official ZenYukti title,
 * Founder-only (permission profiles.manage). Never reachable through the
 * member's own PATCH /v1/me/profile — see members.Handler.SetTitle.
 */
export interface SetTitleRequest {
  title?: string | null;
}
export interface SetTitleResponse {
  title?: string;
}

/**
 * PATCH /v1/users/{id}/member-since request/response — explicit ZenYukti
 * membership-start date, Founder-only (permission profiles.manage). Never
 * derived from users.created_at — see members.Handler.SetMemberSince.
 */
export interface SetMemberSinceRequest {
  member_since?: string | null;
}
export interface SetMemberSinceResponse {
  member_since?: string;
}

/** GET /v1/users/{id}/journey (Founder-only, permission journey.manage). */
export interface CoreJourneyListResponse {
  journey: CoreJourneyEntry[];
}

/** GET/POST /v1/me/featured-work. */
export interface CoreFeaturedWorkListResponse {
  featured_work: CoreFeaturedWorkItem[];
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

/** One entry in CorePublicProfile.featured_work — member-controlled, no
 * id/user_id/is_public/timestamps (see publicprofiles.featuredWorkResponse). */
export interface ProfileFeaturedWorkItem {
  title: string;
  description?: string;
  url?: string;
  image_url?: string;
  tags: string[];
  date?: string;
  display_order: number;
}

/** One entry in CorePublicProfile.zenyukti_journey — ZenYukti/Founder-
 * controlled, never member-editable. `icon` is a free-text semantic label
 * (e.g. "joined", "role", "milestone") the frontend maps to its own
 * presentation — see publicprofiles.journeyEntryResponse. */
export interface ProfileJourneyEntry {
  title: string;
  description?: string;
  date?: string;
  icon?: string;
  display_order: number;
}

/**
 * GET /v1/profiles/u/{username} — public, no auth required. Backs
 * app.zenyukti.in/u/<username>, the full Digital ZenCard. Deliberately
 * narrower than CoreProfile: no id/email/status/is_public/timestamps — the
 * backend never returns those here at all (see
 * publicprofiles.Handler.Get/profileDetailResponse).
 *
 * quote/location/availability/focus_areas/interests/featured_work are
 * member-controlled (same self-service write path as bio/skills).
 * title/member_since/zenyukti_journey are ZenYukti-controlled — title is no
 * longer even a valid field on PATCH /v1/me/profile as of the 00027
 * ownership-model correction; member_since and zenyukti_journey have no
 * member write path at all. Never blur this boundary in the UI.
 */
export interface CorePublicProfile {
  username: string;
  display_name: string;
  avatar_url?: string;
  banner_url?: string;
  title?: string;
  bio?: string;
  skills: string[];
  socials: ProfileSocials;
  quote?: string;
  location?: string;
  availability?: string;
  focus_areas: string[];
  interests: string[];
  /** "YYYY-MM-DD", ZenYukti-assigned — never derived from an account
   * timestamp. Absent until a Founder explicitly sets it. */
  member_since?: string;
  featured_work: ProfileFeaturedWorkItem[];
  zenyukti_journey: ProfileJourneyEntry[];
}

export interface CoreApiError {
  title?: string;
  status?: number;
  detail?: string;
}
