import Link from "next/link";
import { requireSession } from "@/lib/session";
import { apiFetch, ApiError } from "@/lib/api";
import { StatusDot } from "@/components/StatusBadge";
import {
  canManageInvitations,
  canViewMembers,
  permissionKeys,
} from "@/lib/permissions";
import { hasSocialLink, profileCompleteness, SOCIAL_LABELS } from "@/lib/profile";
import { standingBreakdown } from "@/lib/standing";
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

const ECOSYSTEM = [
  { name: "ZenYukti", domain: "zenyukti.in" },
  { name: "ZenYukti Women", domain: "women.zenyukti.in" },
  { name: "ZenTalks", domain: "zentalks.zenyukti.in" },
  { name: "ZenSolve", domain: "zensolve.zenyukti.in" },
  { name: "ZenYukti Labs", domain: "labs.zenyukti.in" },
] as const;

const EYEBROW = "font-mono text-xs uppercase tracking-widest text-muted";
const LINK = "text-sm text-accent hover:underline";
const CHIP = "rounded-full bg-surface px-2.5 py-1 text-xs";

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

function Card({
  id,
  className = "",
  children,
}: {
  id?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div id={id} className={`rounded-md border border-border p-6 ${className}`}>
      {children}
    </div>
  );
}

function ArrowLink({
  href,
  children,
  className = "",
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link href={href} className={`group inline-flex items-center gap-1 ${LINK} ${className}`}>
      <span>{children}</span>
      <span className="inline-block transition-transform duration-150 group-hover:translate-x-0.5">
        →
      </span>
    </Link>
  );
}

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
  const roleLabel = roles.length > 0 ? roles.map((r) => r.name).join(" · ") : "ZenMate";
  const displayName =
    profile?.display_name || me.email || session.user.email || "ZenMate";
  const profileStats = profile ? profileCompleteness(profile) : null;
  const pendingCount = invitesResult
    ? invitesResult.invitations.filter(
        (i) => i.status.toUpperCase() === "PENDING",
      ).length
    : 0;

  const nextStep = (() => {
    if (!profile) {
      return {
        headline: "Start your story.",
        body: "You're in — now let ZenYukti know who just walked in.",
        cta: "Set up your profile",
        href: "/profile",
      };
    }
    if (profileStats && profileStats.percent < 100) {
      return {
        headline: "Keep building.",
        body: `Add ${profileStats.missing.join(", ")} to round out your profile.`,
        cta: "Complete your profile",
        href: "/profile",
      };
    }
    if (!profile.is_public) {
      return {
        headline: "You're ready.",
        body: "Your profile is fully built — make it public so other ZenMates can find you.",
        cta: "Update visibility",
        href: "/profile",
      };
    }
    if (
      canInvite &&
      invitesResult &&
      !invitesResult.error &&
      invitesResult.invitations.length === 0
    ) {
      return {
        headline: "Grow the crew.",
        body: "You can bring new members into ZenYukti.",
        cta: "Send an invitation",
        href: "/invitations",
      };
    }
    return {
      headline: "You're all set.",
      body: "Your ZenYukti identity is complete — go see what else we're building.",
      cta: "Explore the ecosystem",
      href: "#ecosystem",
    };
  })();

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-5 border-b border-border pb-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-4">
            {profile?.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.avatar_url}
                alt={displayName}
                className="h-16 w-16 shrink-0 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-surface text-xl font-medium text-muted">
                {displayName.slice(0, 1).toUpperCase()}
              </div>
            )}
            <div>
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Welcome back, {displayName}
              </h1>
              <p className="mt-1.5 text-sm text-muted">{roleLabel}</p>
            </div>
          </div>
          <div className="sm:pt-2">
            <StatusDot status={me.status} />
          </div>
        </div>
        <p className="font-mono text-sm text-muted">
          {"// Your corner of the ZenYukti universe."}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <Card>
            <p className={EYEBROW}>Your profile</p>
            <div className="mt-4 flex flex-col gap-4">
              <div>
                <h2 className="text-xl font-semibold">{displayName}</h2>
                {profile?.title && (
                  <p className="text-sm text-muted">{profile.title}</p>
                )}
              </div>

              {profile ? (
                <>
                  {profile.bio ? (
                    <p className="text-sm leading-relaxed">{profile.bio}</p>
                  ) : (
                    <p className="text-sm text-muted">
                      Your bio is currently on vacation. Give people something
                      to know you by.
                    </p>
                  )}

                  {profile.skills.length > 0 && (
                    <div>
                      <p className="mb-2 text-xs uppercase tracking-wide text-muted">
                        Skills
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {profile.skills.map((skill) => (
                          <span key={skill} className={CHIP}>
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {hasSocialLink(profile.socials) && (
                    <div className="flex flex-wrap gap-4 border-t border-border pt-4">
                      {SOCIAL_LABELS.map(
                        ({ key, label }) =>
                          profile.socials[key] && (
                            <a
                              key={key}
                              href={profile.socials[key]}
                              target="_blank"
                              rel="noreferrer"
                              className={LINK}
                            >
                              {label}
                            </a>
                          ),
                      )}
                    </div>
                  )}
                </>
              ) : (
                <p className="text-sm text-muted">
                  You&apos;re all identity, no data yet —{" "}
                  <Link href="/profile" className={LINK}>
                    set up your profile
                  </Link>
                  .
                </p>
              )}
            </div>
          </Card>

          <div className="border-l-2 border-accent/60 pl-5">
            <p className={EYEBROW}>Keep building</p>
            <h3 className="mt-2 text-lg font-semibold">{nextStep.headline}</h3>
            <p className="mt-1 text-sm text-muted">{nextStep.body}</p>
            <ArrowLink href={nextStep.href} className="mt-3">
              {nextStep.cta}
            </ArrowLink>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <Card>
            <p className={EYEBROW}>Your ZenYukti</p>
            <div className="mt-4 flex flex-col gap-4">
              <span className={`w-fit ${CHIP}`}>{roleLabel}</span>
              <p className="text-sm text-muted">
                Member since {formatDate(me.created_at)}
              </p>

              {profileStats && (
                <div className="border-t border-border pt-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted">Profile</span>
                    <span className="tabular-nums text-muted">
                      {profileStats.percent}%
                    </span>
                  </div>
                  <div
                    role="progressbar"
                    aria-label="Profile completeness"
                    aria-valuenow={profileStats.percent}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    className="mt-2 h-1.5 rounded-full bg-border"
                  >
                    <div
                      className="h-1.5 rounded-full bg-accent"
                      style={{ width: `${profileStats.percent}%` }}
                    />
                  </div>
                </div>
              )}

              <Link
                href="/profile"
                className="group mt-1 inline-flex w-fit items-center gap-1 rounded-md border border-border px-3 py-1.5 text-sm hover:bg-surface"
              >
                <span>Edit profile</span>
                <span className="inline-block transition-transform duration-150 group-hover:translate-x-0.5">
                  →
                </span>
              </Link>

              {teamResult && (
                <div className="border-t border-border pt-4">
                  {teamResult.error ? (
                    <p className="text-sm text-red-500">{teamResult.error}</p>
                  ) : (
                    <>
                      <p className="text-sm text-muted">
                        <span className="font-medium text-foreground tabular-nums">
                          {teamResult.members.length}
                        </span>{" "}
                        {teamResult.members.length === 1 ? "member" : "members"}{" "}
                        —{" "}
                        {standingBreakdown(teamResult.members)
                          .map(({ label, count }) => `${count} ${label}`)
                          .join(" · ")}
                      </p>
                      <ArrowLink href="/team" className="mt-1">
                        View team
                      </ArrowLink>
                    </>
                  )}
                </div>
              )}

              {invitesResult && (
                <div className="border-t border-border pt-4">
                  {invitesResult.error ? (
                    <p className="text-sm text-red-500">
                      {invitesResult.error}
                    </p>
                  ) : (
                    <>
                      <p className="text-sm text-muted">
                        <span className="font-medium text-foreground tabular-nums">
                          {pendingCount}
                        </span>{" "}
                        pending {pendingCount === 1 ? "invitation" : "invitations"}
                      </p>
                      <ArrowLink href="/invitations" className="mt-1">
                        Manage
                      </ArrowLink>
                    </>
                  )}
                </div>
              )}
            </div>
          </Card>

          <Card id="ecosystem">
            <p className={EYEBROW}>Explore the ecosystem</p>
            <div className="mt-3 flex flex-col divide-y divide-border">
              {ECOSYSTEM.map((item, i) => (
                <a
                  key={item.domain}
                  href={`https://${item.domain}`}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <span className="font-mono text-xs text-muted">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium transition-colors group-hover:text-accent">
                      {item.name}
                    </span>
                    <span className="block truncate text-xs text-muted">
                      {item.domain}
                    </span>
                  </span>
                  <span className="text-muted transition-transform duration-150 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent">
                    ↗
                  </span>
                </a>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
