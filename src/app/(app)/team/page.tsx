import Link from "next/link";
import { requireSession } from "@/lib/session";
import { apiFetch } from "@/lib/api";
import type { CoreUser, CoreUserDetail } from "@/lib/types";

// Roles surface in this order when present; anything else is appended
// alphabetically after.
const ROLE_PRIORITY = ["Founder", "Co-Founder", "ZenCrew"];

function sortGroups(groups: string[]) {
  return groups.sort((a, b) => {
    const ai = ROLE_PRIORITY.indexOf(a);
    const bi = ROLE_PRIORITY.indexOf(b);
    if (ai !== -1 || bi !== -1) {
      return (ai === -1 ? ROLE_PRIORITY.length : ai) -
        (bi === -1 ? ROLE_PRIORITY.length : bi);
    }
    return a.localeCompare(b);
  });
}

export default async function TeamPage() {
  const session = await requireSession();
  const token = session.access_token;

  const users = await apiFetch<CoreUser[]>("/v1/users", token).catch(
    () => [] as CoreUser[],
  );

  const details = await Promise.all(
    users.map((user) =>
      apiFetch<CoreUserDetail>(`/v1/users/${user.id}`, token).catch(
        () => ({ ...user }) as CoreUserDetail,
      ),
    ),
  );

  const groups = new Map<string, CoreUserDetail[]>();
  for (const user of details) {
    const roleNames = user.roles?.length
      ? user.roles.map((r) => r.name)
      : ["ZenMate"];
    for (const roleName of roleNames) {
      if (!groups.has(roleName)) groups.set(roleName, []);
      groups.get(roleName)!.push(user);
    }
  }

  const orderedGroups = sortGroups([...groups.keys()]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold">ZenYukti team</h1>
        <p className="mt-1 text-sm text-muted">
          The people building and running ZenYukti.
        </p>
      </div>

      {orderedGroups.length === 0 && (
        <p className="text-sm text-muted">No team data to show.</p>
      )}

      {orderedGroups.map((group) => (
        <div key={group}>
          <h2 className="mb-3 text-sm font-medium text-muted">{group}</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
            {groups.get(group)!.map((user) => {
              const displayName =
                user.profile?.display_name || user.profile?.name || user.email;
              return (
                <Link
                  key={`${group}-${user.id}`}
                  href={`/members/${user.id}`}
                  className="flex items-center gap-3 rounded-md border border-border p-3 hover:bg-surface"
                >
                  {user.profile?.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={user.profile.avatar_url}
                      alt={displayName}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface text-sm font-medium text-muted">
                      {displayName.slice(0, 1).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{displayName}</p>
                    {user.profile?.title && (
                      <p className="truncate text-xs text-muted">
                        {user.profile.title}
                      </p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
