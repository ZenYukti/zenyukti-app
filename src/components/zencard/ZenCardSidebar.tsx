import { SOCIAL_LABELS } from "@/lib/profile";
import { ShareProfileButton } from "@/components/zencard/ShareProfileButton";
import { DownloadZenCardButton } from "@/components/zencard/DownloadZenCardButton";
import { SOCIAL_ICONS, VerifiedIcon } from "@/components/zencard/icons";
import type { CorePublicProfile } from "@/lib/types";

const PUBLIC_ORIGIN = "https://app.zenyukti.in";

export function ZenCardSidebar({ profile }: { profile: CorePublicProfile }) {
  const links = SOCIAL_LABELS.filter(({ key }) => profile.socials[key]);
  const profileUrl = `${PUBLIC_ORIGIN}/u/${profile.username}`;
  const shareText = [profile.title, profile.bio].filter(Boolean).join(" — ");

  return (
    <aside className="flex w-full shrink-0 flex-col gap-5 rounded-lg border border-border bg-background p-6 lg:sticky lg:top-8 lg:w-72">
      {/* lg:items-stretch on the parent row (see page.tsx) makes this box
          match the main content column's height — this deliberately does
          not set a self-start/h-fit override, since the previous version's
          "ends right after Share Profile" complaint was exactly that
          override making the card hug only its own (data-dependent)
          content height instead of visually balancing the page. */}
      {/* Identity block — centered as a group (avatar/name/username/title/
          badge/tagline). Social links, buttons, and the quote below stay
          outside this wrapper so they can keep their own alignment. */}
      <div className="flex flex-col items-center gap-5 text-center">
        <div className="relative w-fit">
          {profile.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.avatar_url}
              alt={profile.display_name}
              className="h-24 w-24 rounded-full object-cover"
            />
          ) : (
            <div
              className="flex h-24 w-24 items-center justify-center rounded-full bg-surface text-3xl font-medium text-muted"
              aria-hidden="true"
            >
              {profile.display_name.slice(0, 1).toUpperCase()}
            </div>
          )}
          {/* Decorative — every profile reachable here is an ACTIVE ZenYukti
              member by construction (the public API's own gate), so this is
              not derived from any live-presence data. */}
          <span
            aria-hidden="true"
            className="absolute bottom-1.5 right-1.5 h-4 w-4 rounded-full border-2 border-background bg-emerald-500"
          />
        </div>

        <div>
          <h1 className="font-[family-name:var(--font-serif)] text-xl leading-tight">
            {profile.display_name}
          </h1>
          <p className="mt-1 font-mono text-sm text-muted">@{profile.username}</p>
          {profile.title && (
            <p className="mt-2 text-sm font-medium text-foreground/80">
              {profile.title}
            </p>
          )}
        </div>

        {/* Every profile reachable at /u/<username> is, by the public API's
            own is_public + ACTIVE gate, a real ZenYukti member — this badge
            is unconditional, never derived from an internal ORG_STANDING
            role (Founder/ZenCrew/ZenMate never surface here). */}
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-accent/10 px-3 py-1.5 text-xs font-medium text-accent">
          <span className="h-3.5 w-3.5">
            <VerifiedIcon />
          </span>
          ZenYukti Team Member
        </span>

        {/* Compact tagline line — the same bio used in full in the main
            About Me section below, per spec, just line-clamped here so the
            two don't read as a jarring literal repeat. */}
        {profile.bio && (
          <p className="line-clamp-3 text-sm leading-relaxed text-foreground/80">
            {profile.bio}
          </p>
        )}
      </div>

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

      <div className="flex flex-col gap-2.5">
        <DownloadZenCardButton />
        <ShareProfileButton
          url={profileUrl}
          title={`${profile.display_name} — ZenYukti Team Member`}
          text={shareText || `${profile.display_name} on ZenYukti.`}
        />
      </div>

      {profile.quote && (
        <div className="border-t border-border pt-5 text-center">
          <p className="font-[family-name:var(--font-serif)] text-sm italic leading-relaxed text-foreground/80">
            &ldquo;{profile.quote}&rdquo;
          </p>
          <p className="mt-2 font-[family-name:var(--font-script)] text-xl text-muted">
            — {profile.display_name}
          </p>
        </div>
      )}
    </aside>
  );
}
