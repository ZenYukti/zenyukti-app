import Link from "next/link";
import { requireSession } from "@/lib/session";
import { apiFetch, ApiError } from "@/lib/api";
import { StatusBadge } from "@/components/StatusBadge";
import type { CoreMember, CoreMembersResponse } from "@/lib/types";

const STANDING_LABELS: Record<string, string> = {
  founder: "Founder",
  zencrew: "ZenCrew",
  zenmate: "ZenMate",
};

export default async function MembersPage() {
  const session = await requireSession();

  let members: CoreMember[] = [];
  let loadError: string | null = null;
  try {
    const res = await apiFetch<CoreMembersResponse>(
      "/v1/users",
      session.access_token,
    );
    members = res.members;
  } catch (err) {
    loadError =
      err instanceof ApiError
        ? err.status === 403
          ? "You don't have permission to view the member directory."
          : err.detail || err.message
        : "Couldn't load the member directory.";
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Members</h1>
        <p className="mt-1 text-sm text-muted">
          {loadError
            ? "Member directory"
            : `${members.length} ${members.length === 1 ? "member" : "members"} in ZenYukti.`}
        </p>
      </div>

      {loadError && (
        <p className="rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-500">
          {loadError}
        </p>
      )}

      {!loadError &&
        (members.length === 0 ? (
          <p className="text-sm text-muted">No members to show.</p>
        ) : (
          <div className="divide-y divide-border border-t border-border">
            {members.map((member) => (
              <Link
                key={member.id}
                href={`/members/${member.id}`}
                className="flex items-center justify-between gap-4 py-3 hover:bg-surface"
              >
                <span className="text-sm">{member.email}</span>
                <div className="flex items-center gap-2">
                  {member.standing_role && (
                    <span className="text-xs text-muted">
                      {STANDING_LABELS[member.standing_role] ??
                        member.standing_role}
                    </span>
                  )}
                  <StatusBadge status={member.status} />
                </div>
              </Link>
            ))}
          </div>
        ))}
    </div>
  );
}
