import { notFound } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { Logo } from "@/components/Logo";
import { hasSocialLink, SOCIAL_LABELS } from "@/lib/profile";
import type { CorePublicProfile } from "@/lib/types";

const CHIP = "rounded-full bg-surface px-2.5 py-1 text-xs";

// Public, unauthenticated route (see PUBLIC_PATHS in
// src/lib/supabase/middleware.ts) — fetched server-side via apiFetch(path,
// null), same pattern as the invitation lookup flow, since zenyukti-os has
// no CORS support for a direct browser call.
export default async function PublicProfilePage({
  params,
}: PageProps<"/u/[username]">) {
  const { username } = await params;

  const profile = await apiFetch<CorePublicProfile>(
    `/v1/profiles/u/${encodeURIComponent(username)}`,
    null,
  ).catch(() => null);

  if (!profile) {
    notFound();
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-lg flex-col items-center gap-10 px-4 py-16 sm:px-6">
      <Logo />

      <div className="flex w-full flex-col items-center gap-4 text-center">
        {profile.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={profile.avatar_url}
            alt={profile.display_name}
            className="h-24 w-24 rounded-full object-cover sm:h-28 sm:w-28"
          />
        ) : (
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-surface text-2xl font-medium text-muted sm:h-28 sm:w-28">
            {profile.display_name.slice(0, 1).toUpperCase()}
          </div>
        )}

        <div>
          <h1 className="text-2xl font-semibold">{profile.display_name}</h1>
          <p className="font-mono text-sm text-muted">@{profile.username}</p>
          {profile.title && (
            <p className="mt-1 text-sm text-muted">{profile.title}</p>
          )}
        </div>
      </div>

      {profile.bio && (
        <p className="max-w-md text-center text-sm leading-relaxed">
          {profile.bio}
        </p>
      )}

      {profile.skills.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2">
          {profile.skills.map((skill) => (
            <span key={skill} className={CHIP}>
              {skill}
            </span>
          ))}
        </div>
      )}

      {hasSocialLink(profile.socials) && (
        <div className="flex flex-wrap justify-center gap-4 text-sm">
          {SOCIAL_LABELS.map(
            ({ key, label }) =>
              profile.socials[key] && (
                <a
                  key={key}
                  href={profile.socials[key]}
                  target="_blank"
                  rel="noreferrer"
                  className="text-accent hover:underline"
                >
                  {label}
                </a>
              ),
          )}
        </div>
      )}

      <p className="mt-auto pt-12 font-mono text-xs text-muted">
        Zen<span className="text-accent">Yukti</span> — Learn. Build. Share.
      </p>
    </div>
  );
}
