import Link from "next/link";
import { requireSession } from "@/lib/session";
import { apiFetch } from "@/lib/api";
import { StatusBadge } from "@/components/StatusBadge";
import type { CoreUser, CoreProfile, CoreRole } from "@/lib/types";

const PROFILE_FIELDS: (keyof CoreProfile)[] = [
  "name",
  "display_name",
  "bio",
  "avatar_url",
  "title",
  "github",
  "linkedin",
  "website",
  "skills",
  "team",
];

function profileCompleteness(profile: CoreProfile | null) {
  if (!profile) return 0;
  const filled = PROFILE_FIELDS.filter((field) => {
    const value = profile[field];
    return Array.isArray(value) ? value.length > 0 : Boolean(value);
  });
  return Math.round((filled.length / PROFILE_FIELDS.length) * 100);
}

export default async function DashboardPage() {
  const session = await requireSession();
  const token = session.access_token;

  const [me, profile, roles] = await Promise.all([
    apiFetch<CoreUser>("/v1/me", token).catch(() => null),
    apiFetch<CoreProfile>("/v1/me/profile", token).catch(() => null),
    apiFetch<CoreRole[]>("/v1/me/roles", token).catch(() => []),
  ]);

  const displayName = profile?.display_name || profile?.name || me?.email;
  const completeness = profileCompleteness(profile);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold">Welcome, {displayName}</h1>
        <p className="mt-1 text-sm text-muted">
          Here&apos;s where things stand in ZenYukti.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted">
            Standing
          </p>
          <p className="mt-1 text-sm">
            {roles && roles.length > 0
              ? roles.map((r) => r.name).join(", ")
              : "ZenMate"}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-muted">
            Account status
          </p>
          <div className="mt-1">
            {me ? (
              <StatusBadge status={me.status} />
            ) : (
              <span className="text-sm text-muted">Unavailable</span>
            )}
          </div>
        </div>
        {profile && (
          <div>
            <p className="text-xs uppercase tracking-wide text-muted">
              Profile completeness
            </p>
            <p className="mt-1 text-sm">{completeness}%</p>
          </div>
        )}
      </div>

      <div>
        <p className="mb-3 text-xs uppercase tracking-wide text-muted">
          Quick links
        </p>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/profile"
            className="rounded-md border border-border px-3 py-1.5 text-sm hover:bg-surface"
          >
            View profile
          </Link>
          <Link
            href="/team"
            className="rounded-md border border-border px-3 py-1.5 text-sm hover:bg-surface"
          >
            ZenYukti team
          </Link>
          <Link
            href="/members"
            className="rounded-md border border-border px-3 py-1.5 text-sm hover:bg-surface"
          >
            Member directory
          </Link>
        </div>
      </div>
    </div>
  );
}
