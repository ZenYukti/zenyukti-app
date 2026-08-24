import Link from "next/link";
import { requireSession } from "@/lib/session";
import { apiFetch } from "@/lib/api";
import { StatusBadge } from "@/components/StatusBadge";
import type { CoreUser } from "@/lib/types";

export default async function MembersPage() {
  const session = await requireSession();

  const users = await apiFetch<CoreUser[]>(
    "/v1/users",
    session.access_token,
  ).catch(() => [] as CoreUser[]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Members</h1>
        <p className="mt-1 text-sm text-muted">
          {users.length} {users.length === 1 ? "member" : "members"} in
          ZenYukti.
        </p>
      </div>

      {users.length === 0 ? (
        <p className="text-sm text-muted">No members to show.</p>
      ) : (
        <div className="divide-y divide-border border-t border-border">
          {users.map((user) => (
            <Link
              key={user.id}
              href={`/members/${user.id}`}
              className="flex items-center justify-between gap-4 py-3 hover:bg-surface"
            >
              <span className="text-sm">{user.email}</span>
              <StatusBadge status={user.status} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
