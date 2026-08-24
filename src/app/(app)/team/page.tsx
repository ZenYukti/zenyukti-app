import Link from "next/link";
import { requireSession } from "@/lib/session";
import { apiFetch, ApiError } from "@/lib/api";
import { StatusBadge } from "@/components/StatusBadge";
import type { CoreMember, CoreMembersResponse } from "@/lib/types";

// Real standing_role slugs (zenyukti-os's seeded RBAC roles), in display
// order. Anything else (or no standing) is grouped last as "Member".
const STANDING_ORDER = ["founder", "zencrew", "zenmate"];
const STANDING_LABELS: Record<string, string> = {
  founder: "Founder",
  zencrew: "ZenCrew",
  zenmate: "ZenMate",
};

function standingLabel(slug: string | null | undefined) {
  if (!slug) return "Member";
  return STANDING_LABELS[slug] ?? slug;
}

function groupOrder(slug: string) {
  const i = STANDING_ORDER.indexOf(slug);
  return i === -1 ? STANDING_ORDER.length : i;
}

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
    (a, b) => groupOrder(a) - groupOrder(b),
  );

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold">ZenYukti team</h1>
        <p className="mt-1 text-sm text-muted">
          The people building and running ZenYukti.
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

      {orderedGroups.map((slug) => (
        <div key={slug || "unassigned"}>
          <h2 className="mb-3 text-sm font-medium text-muted">
            {standingLabel(slug)}
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
            {groups.get(slug)!.map((member) => (
              <Link
                key={member.id}
                href={`/members/${member.id}`}
                className="flex items-center gap-3 rounded-md border border-border p-3 hover:bg-surface"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface text-sm font-medium text-muted">
                  {member.email.slice(0, 1).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {member.email}
                  </p>
                </div>
                <StatusBadge status={member.status} />
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
