import Link from "next/link";
import { requireSession } from "@/lib/session";
import { apiFetch, ApiError } from "@/lib/api";
import { StatusBadge } from "@/components/StatusBadge";
import {
  canManageInvitations,
  canViewMembers,
  permissionKeys,
} from "@/lib/permissions";
import type {
  CoreUser,
  CoreProfile,
  CoreRolesResponse,
  CorePermissionsResponse,
  CoreMember,
  CoreMembersResponse,
  CoreInvitation,
  CoreInvitationsResponse,
} from "@/lib/types";

// Only fields the real /v1/me/profile response actually has (see
// lib/types.ts) — the rest of the speculative profile fields don't exist
// on the API and would always read as missing.
const PROFILE_FIELDS: { key: keyof CoreProfile; label: string }[] = [
  { key: "display_name", label: "display name" },
  { key: "avatar_url", label: "avatar" },
  { key: "bio", label: "bio" },
];

function profileCompleteness(profile: CoreProfile) {
  const missing = PROFILE_FIELDS.filter((f) => !profile[f.key]);
  const filled = PROFILE_FIELDS.length - missing.length;
  return {
    percent: Math.round((filled / PROFILE_FIELDS.length) * 100),
    missing: missing.map((f) => f.label),
  };
}

const STANDING_LABELS: Record<string, string> = {
  founder: "Founder",
  zencrew: "ZenCrew",
  zenmate: "ZenMate",
};
const STANDING_ORDER = ["founder", "zencrew", "zenmate"];

function standingBreakdown(members: CoreMember[]) {
  const counts = new Map<string, number>();
  for (const m of members) {
    const slug = m.standing_role ?? "";
    counts.set(slug, (counts.get(slug) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort(([a], [b]) => {
      const ai = STANDING_ORDER.indexOf(a);
      const bi = STANDING_ORDER.indexOf(b);
      return (
        (ai === -1 ? STANDING_ORDER.length : ai) -
        (bi === -1 ? STANDING_ORDER.length : bi)
      );
    })
    .map(([slug, count]) => ({
      label: slug ? (STANDING_LABELS[slug] ?? slug) : "Unassigned",
      count,
    }));
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function errorMessage(err: unknown, fallback: string, forbidden: string) {
  if (err instanceof ApiError) {
    return err.status === 403 ? forbidden : err.detail || err.message;
  }
  return fallback;
}

function Panel({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3 p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-medium text-muted">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

const PANEL_LINK = "text-sm text-accent hover:underline";

export default async function DashboardPage() {
  const session = await requireSession();
  const token = session.access_token;

  const [me, profile, rolesRes, permsRes] = await Promise.all([
    apiFetch<CoreUser>("/v1/me", token).catch(() => null),
    apiFetch<CoreProfile>("/v1/me/profile", token).catch(() => null),
    apiFetch<CoreRolesResponse>("/v1/me/roles", token).catch(() => null),
    apiFetch<CorePermissionsResponse>("/v1/me/permissions", token).catch(
      () => null,
    ),
  ]);

  if (!me) {
    return (
      <p className="rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-500">
        Couldn&apos;t load your dashboard right now. Try refreshing, or check
        back shortly.
      </p>
    );
  }

  const permissions = permissionKeys(permsRes);
  const canTeam = canViewMembers(permissions);
  const canInvite = canManageInvitations(permissions);

  const [teamResult, invitesResult] = await Promise.all([
    canTeam
      ? apiFetch<CoreMembersResponse>("/v1/users", token)
          .then((res) => ({ members: res.members, error: null }) as const)
          .catch(
            (err) =>
              ({
                members: [] as CoreMember[],
                error: errorMessage(
                  err,
                  "Couldn't load team data.",
                  "You don't have permission to view the team.",
                ),
              }) as const,
          )
      : Promise.resolve(null),
    canInvite
      ? apiFetch<CoreInvitationsResponse>("/v1/invitations", token)
          .then((res) => ({ invitations: res.invitations, error: null }) as const)
          .catch(
            (err) =>
              ({
                invitations: [] as CoreInvitation[],
                error: errorMessage(
                  err,
                  "Couldn't load invitations.",
                  "You don't have permission to view invitations.",
                ),
              }) as const,
          )
      : Promise.resolve(null),
  ]);

  const roles = rolesRes?.roles ?? [];
  const standing =
    roles.length > 0 ? roles.map((r) => r.name).join(", ") : "ZenMate";
  const displayName =
    profile?.display_name || me.email || session.user.email || "ZenMate";

  const panelCount = 1 + (teamResult ? 1 : 0) + (invitesResult ? 1 : 0);
  const gridColsClass =
    panelCount === 3
      ? "lg:grid-cols-3"
      : panelCount === 2
        ? "lg:grid-cols-2"
        : "lg:grid-cols-1";

  const recentInvitations = invitesResult
    ? [...invitesResult.invitations]
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        )
        .slice(0, 4)
    : [];
  const pendingCount = invitesResult
    ? invitesResult.invitations.filter(
        (i) => i.status.toUpperCase() === "PENDING",
      ).length
    : 0;
  const profileStats = profile ? profileCompleteness(profile) : null;

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          {profile?.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.avatar_url}
              alt={displayName}
              className="h-14 w-14 shrink-0 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-surface text-lg font-medium text-muted">
              {displayName.slice(0, 1).toUpperCase()}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-semibold">{displayName}</h1>
            <p className="mt-0.5 text-sm text-muted">
              {standing} · Member since {formatDate(me.created_at)}
            </p>
          </div>
        </div>
        <StatusBadge status={me.status} />
      </div>

      <div
        className={`grid grid-cols-1 divide-y divide-border border border-border rounded-md lg:divide-y-0 lg:divide-x ${gridColsClass}`}
      >
        <Panel
          title="Profile"
          action={
            <Link href="/profile" className={PANEL_LINK}>
              Edit →
            </Link>
          }
        >
          {profileStats ? (
            <>
              <div className="flex items-center gap-3">
                <div
                  role="progressbar"
                  aria-label="Profile completeness"
                  aria-valuenow={profileStats.percent}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  className="h-1.5 flex-1 rounded-full bg-border"
                >
                  <div
                    className="h-1.5 rounded-full bg-accent"
                    style={{ width: `${profileStats.percent}%` }}
                  />
                </div>
                <span className="text-sm tabular-nums text-muted">
                  {profileStats.percent}%
                </span>
              </div>
              <p className="text-sm text-muted">
                {profileStats.missing.length > 0
                  ? `Add ${profileStats.missing.join(", ")} to complete your profile.`
                  : "Your profile is complete."}
              </p>
            </>
          ) : (
            <>
              <p className="text-sm text-muted">
                You haven&apos;t set up your profile yet.
              </p>
              <Link href="/profile" className={PANEL_LINK}>
                Set up your profile →
              </Link>
            </>
          )}
        </Panel>

        {teamResult && (
          <Panel
            title="Team"
            action={
              <Link href="/team" className={PANEL_LINK}>
                View →
              </Link>
            }
          >
            {teamResult.error ? (
              <p className="text-sm text-red-500">{teamResult.error}</p>
            ) : (
              <>
                <p className="text-2xl font-semibold tabular-nums">
                  {teamResult.members.length}
                </p>
                <p className="text-sm text-muted">
                  {teamResult.members.length === 1 ? "member" : "members"} in
                  ZenYukti
                </p>
                <ul className="flex flex-col gap-1 text-sm">
                  {standingBreakdown(teamResult.members).map(
                    ({ label, count }) => (
                      <li key={label} className="flex justify-between">
                        <span className="text-muted">{label}</span>
                        <span className="tabular-nums">{count}</span>
                      </li>
                    ),
                  )}
                </ul>
                <Link href="/members" className={PANEL_LINK}>
                  Browse member directory →
                </Link>
              </>
            )}
          </Panel>
        )}

        {invitesResult && (
          <Panel
            title="Invitations"
            action={
              <Link href="/invitations" className={PANEL_LINK}>
                Manage →
              </Link>
            }
          >
            {invitesResult.error ? (
              <p className="text-sm text-red-500">{invitesResult.error}</p>
            ) : (
              <>
                <p className="text-2xl font-semibold tabular-nums">
                  {pendingCount}
                </p>
                <p className="text-sm text-muted">
                  pending {pendingCount === 1 ? "invitation" : "invitations"}
                </p>
                {recentInvitations.length > 0 && (
                  <ul className="flex flex-col gap-1.5">
                    {recentInvitations.map((inv) => (
                      <li
                        key={inv.id}
                        className="flex items-center justify-between gap-2 text-sm"
                      >
                        <span className="truncate text-muted">
                          {inv.email}
                        </span>
                        <StatusBadge status={inv.status} />
                      </li>
                    ))}
                  </ul>
                )}
                <Link href="/invitations" className={PANEL_LINK}>
                  Invite someone →
                </Link>
              </>
            )}
          </Panel>
        )}
      </div>
    </div>
  );
}
