import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSession } from "@/lib/session";
import { apiFetch, ApiError } from "@/lib/api";
import { StatusBadge } from "@/components/StatusBadge";
import type { CoreUserDetail } from "@/lib/types";

export default async function MemberDetailPage({
  params,
}: PageProps<"/members/[id]">) {
  const { id } = await params;
  const session = await requireSession();

  let user: CoreUserDetail | null = null;
  try {
    user = await apiFetch<CoreUserDetail>(
      `/v1/users/${id}`,
      session.access_token,
    );
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) {
      notFound();
    }
    throw err;
  }

  const profile = user.profile;
  const displayName = profile?.display_name || profile?.name || user.email;

  return (
    <div className="flex flex-col gap-6">
      <Link href="/members" className="text-sm text-muted hover:text-foreground">
        ← Members
      </Link>

      <div className="flex items-center gap-4">
        {profile?.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={profile.avatar_url}
            alt={displayName}
            className="h-16 w-16 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface text-xl font-medium text-muted">
            {displayName.slice(0, 1).toUpperCase()}
          </div>
        )}
        <div>
          <h1 className="text-xl font-semibold">{displayName}</h1>
          {profile?.title && <p className="text-sm text-muted">{profile.title}</p>}
          <p className="text-sm text-muted">{user.email}</p>
        </div>
        <div className="ml-auto">
          <StatusBadge status={user.status} />
        </div>
      </div>

      {profile?.bio && <p className="text-sm leading-relaxed">{profile.bio}</p>}

      {user.roles && user.roles.length > 0 && (
        <div>
          <p className="mb-2 text-xs uppercase tracking-wide text-muted">
            Roles
          </p>
          <div className="flex flex-wrap gap-2">
            {user.roles.map((role) => (
              <span
                key={role.id ?? role.name}
                className="rounded-full bg-surface px-2.5 py-1 text-xs"
              >
                {role.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {profile?.skills && profile.skills.length > 0 && (
        <div>
          <p className="mb-2 text-xs uppercase tracking-wide text-muted">
            Skills
          </p>
          <div className="flex flex-wrap gap-2">
            {profile.skills.map((skill) => (
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

      <div className="flex flex-wrap gap-4 text-sm">
        {profile?.team && (
          <span className="text-muted">
            Team: <span className="text-foreground">{profile.team}</span>
          </span>
        )}
        {profile?.github && (
          <a href={profile.github} target="_blank" rel="noreferrer" className="text-accent hover:underline">
            GitHub
          </a>
        )}
        {profile?.linkedin && (
          <a href={profile.linkedin} target="_blank" rel="noreferrer" className="text-accent hover:underline">
            LinkedIn
          </a>
        )}
        {profile?.website && (
          <a href={profile.website} target="_blank" rel="noreferrer" className="text-accent hover:underline">
            Website
          </a>
        )}
      </div>
    </div>
  );
}
