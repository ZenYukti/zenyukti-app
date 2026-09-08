import type { ReactNode } from "react";
import { SOCIAL_LABELS } from "@/lib/profile";
import { ShareProfileButton } from "@/components/zencard/ShareProfileButton";
import type { CorePublicProfile, ProfileSocials } from "@/lib/types";

const PUBLIC_ORIGIN = "https://app.zenyukti.in";

// Minimal, dependency-free line icons for the five known social keys — no
// icon library exists in this project, and five small inline SVGs is
// cheaper than adding one just for this sidebar.
const SOCIAL_ICONS: Record<keyof ProfileSocials, ReactNode> = {
  github: (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.833.092-.647.35-1.088.636-1.339-2.221-.253-4.556-1.113-4.556-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.338 1.909-1.296 2.747-1.026 2.747-1.026.546 1.378.203 2.397.1 2.65.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.31.678.921.678 1.856 0 1.34-.012 2.42-.012 2.75 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2Z" />
    </svg>
  ),
  linkedin: (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M6.94 5a1.94 1.94 0 1 1-3.88 0 1.94 1.94 0 0 1 3.88 0ZM3.5 8.75h3.38V21H3.5V8.75Zm6.5 0h3.24v1.68h.05c.45-.85 1.56-1.75 3.21-1.75 3.43 0 4.06 2.26 4.06 5.2V21h-3.38v-5.4c0-1.29-.02-2.94-1.79-2.94-1.8 0-2.08 1.4-2.08 2.85V21H10V8.75Z" />
    </svg>
  ),
  x: (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231ZM17.083 19.77h1.833L7.084 4.126H5.117Z" />
    </svg>
  ),
  instagram: (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2c2.717 0 3.056.01 4.122.06 1.065.05 1.79.217 2.428.465.66.256 1.216.6 1.772 1.153.5.5.888 1.11 1.153 1.772.247.637.415 1.363.465 2.428.048 1.066.06 1.405.06 4.122 0 2.717-.012 3.056-.06 4.122-.05 1.065-.218 1.79-.465 2.428a4.902 4.902 0 0 1-1.153 1.772 4.904 4.904 0 0 1-1.772 1.153c-.637.247-1.363.415-2.428.465-1.066.048-1.405.06-4.122.06-2.717 0-3.056-.012-4.122-.06-1.065-.05-1.79-.218-2.428-.465a4.902 4.902 0 0 1-1.772-1.153 4.904 4.904 0 0 1-1.153-1.772c-.248-.637-.415-1.363-.465-2.428C2.012 15.056 2 14.717 2 12c0-2.717.012-3.056.06-4.122.05-1.066.217-1.79.465-2.428a4.902 4.902 0 0 1 1.153-1.772A4.904 4.904 0 0 1 5.45 2.525c.637-.248 1.363-.415 2.428-.465C8.944 2.012 9.283 2 12 2Zm0 1.802c-2.67 0-2.986.01-4.04.059-.976.044-1.505.207-1.858.344-.467.181-.8.398-1.15.748-.35.35-.567.683-.748 1.15-.137.353-.3.882-.344 1.858-.05 1.054-.06 1.37-.06 4.04 0 2.67.01 2.986.06 4.04.044.976.207 1.505.344 1.858.181.467.398.8.748 1.15.35.35.683.567 1.15.748.353.137.882.3 1.858.344 1.053.05 1.37.06 4.04.06 2.67 0 2.987-.01 4.04-.06.976-.044 1.505-.207 1.858-.344.467-.181.8-.398 1.15-.748.35-.35.567-.683.748-1.15.137-.353.3-.882.344-1.858.05-1.054.06-1.37.06-4.04 0-2.67-.01-2.986-.06-4.04-.044-.976-.207-1.505-.344-1.858a3.09 3.09 0 0 0-.748-1.15 3.09 3.09 0 0 0-1.15-.748c-.353-.137-.882-.3-1.858-.344-1.053-.05-1.37-.06-4.04-.06Zm0 3.063a5.135 5.135 0 1 1 0 10.27 5.135 5.135 0 0 1 0-10.27Zm0 1.802a3.333 3.333 0 1 0 0 6.666 3.333 3.333 0 0 0 0-6.666Zm5.338-1.995a1.2 1.2 0 1 1-2.4 0 1.2 1.2 0 0 1 2.4 0Z" />
    </svg>
  ),
  website: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.4 2.6 3.6 5.7 3.6 9s-1.2 6.4-3.6 9c-2.4-2.6-3.6-5.7-3.6-9s1.2-6.4 3.6-9Z" />
    </svg>
  ),
};

export function ZenCardSidebar({ profile }: { profile: CorePublicProfile }) {
  const links = SOCIAL_LABELS.filter(({ key }) => profile.socials[key]);
  const profileUrl = `${PUBLIC_ORIGIN}/u/${profile.username}`;
  const shareText = [profile.title, profile.bio].filter(Boolean).join(" — ");

  return (
    <aside className="flex w-full shrink-0 flex-col gap-5 rounded-lg border border-border bg-background p-6 lg:sticky lg:top-8 lg:w-72">
      {profile.avatar_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={profile.avatar_url}
          alt={profile.display_name}
          className="h-28 w-28 rounded-full object-cover"
        />
      ) : (
        <div
          className="flex h-28 w-28 items-center justify-center rounded-full bg-surface text-3xl font-medium text-muted"
          aria-hidden="true"
        >
          {profile.display_name.slice(0, 1).toUpperCase()}
        </div>
      )}

      <div>
        <h1 className="text-xl font-semibold leading-tight">
          {profile.display_name}
        </h1>
        <p className="font-mono text-sm text-muted">@{profile.username}</p>
        {profile.title && (
          <p className="mt-2 text-sm text-muted">{profile.title}</p>
        )}
      </div>

      {/* Every profile reachable at /u/<username> is, by the public API's
          own is_public + ACTIVE gate, a real ZenYukti member — this badge
          is unconditional, not derived from any internal role. */}
      <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
        <svg
          viewBox="0 0 20 20"
          fill="currentColor"
          className="h-3.5 w-3.5"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M16.704 5.29a1 1 0 0 1 .006 1.415l-7.5 7.5a1 1 0 0 1-1.42.006l-3.5-3.5a1 1 0 1 1 1.414-1.414l2.793 2.793 6.793-6.793a1 1 0 0 1 1.414-.007Z"
            clipRule="evenodd"
          />
        </svg>
        ZenYukti Team Member
      </span>

      {links.length > 0 && (
        <nav
          aria-label="Social links"
          className="flex flex-col divide-y divide-border border-y border-border"
        >
          {links.map(({ key, label }) => (
            <a
              key={key}
              href={profile.socials[key]}
              target="_blank"
              rel="noreferrer"
              aria-label={`${profile.display_name} on ${label}`}
              className="flex items-center justify-between gap-3 py-3 text-sm transition-colors hover:text-accent"
            >
              <span className="flex items-center gap-3">
                <span className="h-4 w-4 shrink-0">{SOCIAL_ICONS[key]}</span>
                {label}
              </span>
              <span aria-hidden="true" className="text-muted">
                →
              </span>
            </a>
          ))}
        </nav>
      )}

      <ShareProfileButton
        url={profileUrl}
        title={`${profile.display_name} — ZenYukti Team Member`}
        text={shareText || `${profile.display_name} on ZenYukti.`}
      />
    </aside>
  );
}
