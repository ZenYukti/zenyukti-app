import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSession } from "@/lib/session";
import { apiFetch, ApiError } from "@/lib/api";
import { StatusBadge } from "@/components/StatusBadge";
import { PublicTeamMembership } from "@/components/PublicTeamMembership";
import { OfficialProfileEditor } from "@/components/OfficialProfileEditor";
import { JourneyEditor } from "@/components/JourneyEditor";
import { standingLabel } from "@/lib/standing";
import { SOCIAL_LABELS } from "@/lib/profile";
import {
  canManagePublicTeam,
  canManageOfficialProfile,
  canManageJourney,
  permissionKeys,
} from "@/lib/permissions";
import type {
  CoreMemberDetail,
  CorePermissionsResponse,
  CoreJourneyListResponse,
} from "@/lib/types";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function MemberDetailPage({
  params,
}: PageProps<"/members/[id]">) {
  const { id } = await params;
  const session = await requireSession();
  const token = session.access_token;

  const perms = await apiFetch<CorePermissionsResponse>(
    "/v1/me/permissions",
    token,
  ).catch(() => null);
  const permissions = permissionKeys(perms);
  const canManageTeam = canManagePublicTeam(permissions);
  const canManageProfile = canManageOfficialProfile(permissions);
  const canManageMemberJourney = canManageJourney(permissions);

  let member: CoreMemberDetail | null = null;
  let loadError: string | null = null;
  try {
    member = await apiFetch<CoreMemberDetail>(`/v1/users/${id}`, token);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) {
      notFound();
    }
    loadError =
      err instanceof ApiError
        ? err.status === 403
          ? "You don't have permission to view this member."
          : err.detail || err.message
        : "Couldn't load this member.";
  }

  // Only fetched when the viewer can actually manage Journey — GET
  // /v1/users/{id}/journey is itself permission-gated (journey.manage), so
  // this avoids a request that would just 403 for anyone else.
  const journeyEntries =
    member && canManageMemberJourney
      ? await apiFetch<CoreJourneyListResponse>(`/v1/users/${id}/journey`, token)
          .then((res) => res.journey)
          .catch(() => [])
      : [];

  return (
    <div className="flex flex-col gap-6">
      <Link href="/members" className="text-sm text-muted hover:text-foreground">
        ← Members
      </Link>

      {loadError && (
        <p className="rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-500">
          {loadError}
        </p>
      )}

      {member && (
        <>
          <div className="flex items-center gap-4">
            {member.profile?.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={member.profile.avatar_url}
                alt={member.profile.display_name}
                className="h-16 w-16 shrink-0 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-surface text-xl font-medium text-muted">
                {(member.profile?.display_name || member.email)
                  .slice(0, 1)
                  .toUpperCase()}
              </div>
            )}
            <div>
              <h1 className="text-xl font-semibold">
                {member.profile?.display_name || member.email}
              </h1>
              {member.profile?.title && (
                <p className="text-sm text-muted">{member.profile.title}</p>
              )}
              {member.profile?.display_name && (
                <p className="text-sm text-muted">{member.email}</p>
              )}
              {member.standing_role && (
                <p className="text-sm text-muted">
                  {standingLabel(member.standing_role)}
                </p>
              )}
            </div>
            <div className="ml-auto">
              <StatusBadge status={member.status} />
            </div>
          </div>

          {member.profile?.bio && (
            <p className="text-sm leading-relaxed">{member.profile.bio}</p>
          )}

          {member.profile && member.profile.skills.length > 0 && (
            <div>
              <p className="mb-2 text-xs uppercase tracking-wide text-muted">
                Skills
              </p>
              <div className="flex flex-wrap gap-2">
                {member.profile.skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full bg-surface px-2.5 py-1 text-xs"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {member.profile &&
            Object.values(member.profile.socials).some(Boolean) && (
              <div className="flex flex-wrap gap-4 text-sm">
                {SOCIAL_LABELS.map(
                  ({ key, label }) =>
                    member.profile!.socials[key] && (
                      <a
                        key={key}
                        href={member.profile!.socials[key]}
                        target="_blank"
                        rel="noreferrer"
                        className="text-accent hover:underline"
                      >
                        {label}
                      </a>
                    ),
                )}
              </div>
            )}

          {member.roles.length > 0 && (
            <div>
              <p className="mb-2 text-xs uppercase tracking-wide text-muted">
                Roles
              </p>
              <div className="flex flex-wrap gap-2">
                {member.roles.map((role) => (
                  <span
                    key={`${role.slug}-${role.scope_type}-${role.scope_id ?? "global"}`}
                    className="rounded-full bg-surface px-2.5 py-1 text-xs"
                  >
                    {standingLabel(role.slug)}
                  </span>
                ))}
              </div>
            </div>
          )}

          <PublicTeamMembership
            memberId={member.id}
            initialPublicTeamMember={member.public_team_member}
            canManage={canManageTeam}
          />

          {canManageProfile && (
            <OfficialProfileEditor
              userId={member.id}
              currentTitle={member.profile?.title}
            />
          )}

          {canManageMemberJourney && (
            <JourneyEditor userId={member.id} initialEntries={journeyEntries} />
          )}

          <p className="text-sm text-muted">
            Account created {formatDate(member.created_at)}
            {member.disabled_at &&
              ` · Disabled ${formatDate(member.disabled_at)}`}
          </p>
        </>
      )}
    </div>
  );
}
