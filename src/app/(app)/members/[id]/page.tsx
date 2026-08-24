import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSession } from "@/lib/session";
import { apiFetch, ApiError } from "@/lib/api";
import { StatusBadge } from "@/components/StatusBadge";
import type { CoreMemberDetail } from "@/lib/types";

const STANDING_LABELS: Record<string, string> = {
  founder: "Founder",
  zencrew: "ZenCrew",
  zenmate: "ZenMate",
};

function roleLabel(slug: string) {
  return STANDING_LABELS[slug] ?? slug;
}

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

  let member: CoreMemberDetail | null = null;
  let loadError: string | null = null;
  try {
    member = await apiFetch<CoreMemberDetail>(
      `/v1/users/${id}`,
      session.access_token,
    );
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
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-surface text-xl font-medium text-muted">
              {member.email.slice(0, 1).toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl font-semibold">{member.email}</h1>
              {member.standing_role && (
                <p className="text-sm text-muted">
                  {roleLabel(member.standing_role)}
                </p>
              )}
            </div>
            <div className="ml-auto">
              <StatusBadge status={member.status} />
            </div>
          </div>

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
                    {roleLabel(role.slug)}
                  </span>
                ))}
              </div>
            </div>
          )}

          <p className="text-sm text-muted">
            Member since {formatDate(member.created_at)}
          </p>
        </>
      )}
    </div>
  );
}
