import Link from "next/link";
import { requireSession } from "@/lib/session";
import { apiFetch, ApiError } from "@/lib/api";
import { StatusBadge } from "@/components/StatusBadge";
import { standingBreakdown, standingLabel, standingSortIndex } from "@/lib/standing";
import type { CoreMember, CoreMembersResponse } from "@/lib/types";

export default async function TeamPage() {
  const session = await requireSession();
  const token = session.access_token;

  let members: CoreMember[] = [];
  let loadError: string | null = null;
  try {
    const res = await apiFetch<CoreMembersResponse>("/v1/users", token);
    members = res.members;
  } catch (err) {
    loadError =
      err instanceof ApiError
        ? err.status === 403
          ? "You don't have permission to view the team directory."
          : err.detail || err.message
        : "Couldn't load the team directory.";
  }

  const groups = new Map<string, CoreMember[]>();
  for (const member of members) {
    const slug = member.standing_role ?? "";
    if (!groups.has(slug)) groups.set(slug, []);
    groups.get(slug)!.push(member);
  }
  const orderedGroups = [...groups.keys()].sort(
    (a, b) => standingSortIndex(a) - standingSortIndex(b),
  );

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold">ZenYukti team</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted">
          ZenYukti is a student-led, community-driven technology community —
          Learn. Build. Share. This is everyone building and running it, and
          the standing each person currently holds.
        </p>
      </div>

      {loadError && (
        <p className="rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-500">
          {loadError}
        </p>
      )}

      {!loadError && members.length === 0 && (
        <p className="text-sm text-muted">No team members to show.</p>
      )}

      {!loadError && members.length > 0 && (
        <div className="flex flex-col gap-1 border-b border-border pb-6 sm:flex-row sm:items-center sm:gap-8">
          <div>
            <p className="text-2xl font-semibold tabular-nums">
              {members.length}
            </p>
            <p className="text-sm text-muted">
              {members.length === 1 ? "person" : "people"} total
            </p>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
            {standingBreakdown(members).map(({ label, count }) => (
              <span key={label} className="text-muted">
                {label}{" "}
                <span className="font-medium text-foreground">{count}</span>
              </span>
            ))}
          </div>
          <Link
            href="/members"
            className="text-sm text-accent hover:underline sm:ml-auto"
          >
            Search the full member directory →
          </Link>
        </div>
      )}

      {orderedGroups.map((slug) => (
        <div key={slug || "unassigned"}>
          <h2 className="mb-3 text-sm font-medium text-muted">
            {standingLabel(slug)}
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
            {groups.get(slug)!.map((member) => {
              const name = member.profile?.display_name || member.email;
              return (
                <Link
                  key={member.id}
                  href={`/members/${member.id}`}
                  className="flex items-center gap-3 rounded-md border border-border p-3 hover:bg-surface"
                >
                  {member.profile?.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={member.profile.avatar_url}
                      alt={name}
                      className="h-10 w-10 shrink-0 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface text-sm font-medium text-muted">
                      {name.slice(0, 1).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{name}</p>
                    <p className="truncate text-xs text-muted">
                      {member.profile?.title || member.email}
                    </p>
                  </div>
                  <StatusBadge status={member.status} />
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
