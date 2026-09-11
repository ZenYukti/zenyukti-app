import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { PublicNav } from "@/components/zencard/PublicNav";
import { ZenCardSidebar } from "@/components/zencard/ZenCardSidebar";
import { ZenYuktiHero } from "@/components/zencard/ZenYuktiHero";
import { MetaStrip } from "@/components/zencard/MetaStrip";
import { AboutSection } from "@/components/zencard/AboutSection";
import { SkillsSection } from "@/components/zencard/SkillsSection";
import { InterestsSection } from "@/components/zencard/InterestsSection";
import { FeaturedWorkSection } from "@/components/zencard/FeaturedWorkSection";
import { JourneySection } from "@/components/zencard/JourneySection";
import { ZenYuktiCTA } from "@/components/zencard/ZenYuktiCTA";
import { Footer } from "@/components/zencard/Footer";
import type { CorePublicProfile } from "@/lib/types";

const MAX_DESCRIPTION_LENGTH = 160;

// Public, unauthenticated route (see PUBLIC_PATHS in
// src/lib/supabase/middleware.ts) — fetched server-side via apiFetch(path,
// null), same pattern as the invitation lookup flow, since zenyukti-os has
// no CORS support for a direct browser call. One request backs the whole
// page: GET /v1/profiles/u/{username} already returns the complete ZenCard
// (skills, socials, quote, featured_work, zenyukti_journey, ...) — no
// per-section follow-up calls. Next automatically memoizes identical
// fetch() calls within one render pass, so calling this from both
// generateMetadata and the page below only hits the network once.
async function getProfile(username: string): Promise<CorePublicProfile | null> {
  return apiFetch<CorePublicProfile>(
    `/v1/profiles/u/${encodeURIComponent(username)}`,
    null,
  ).catch(() => null);
}

function metaDescription(profile: CorePublicProfile) {
  const description =
    [profile.title, profile.bio].filter(Boolean).join(" — ") ||
    `${profile.display_name}'s ZenYukti profile.`;
  return description.length > MAX_DESCRIPTION_LENGTH
    ? `${description.slice(0, MAX_DESCRIPTION_LENGTH - 1)}…`
    : description;
}

export async function generateMetadata({
  params,
}: PageProps<"/u/[username]">): Promise<Metadata> {
  const { username } = await params;
  const profile = await getProfile(username);
  if (!profile) return {};

  const title = `${profile.display_name} — ZenYukti`;
  const description = metaDescription(profile);
  const canonicalPath = `/u/${profile.username}`;

  return {
    title,
    description,
    alternates: { canonical: canonicalPath },
    openGraph: {
      type: "profile",
      title,
      description,
      url: canonicalPath,
      username: profile.username,
      images: profile.avatar_url ? [{ url: profile.avatar_url }] : undefined,
    },
    twitter: {
      card: profile.avatar_url ? "summary_large_image" : "summary",
      title,
      description,
      images: profile.avatar_url ? [profile.avatar_url] : undefined,
    },
  };
}

export default async function PublicProfilePage({
  params,
}: PageProps<"/u/[username]">) {
  const { username } = await params;
  const profile = await getProfile(username);

  if (!profile) {
    notFound();
  }

  return (
    // data-zencard: this page is a light-first design by spec regardless
    // of the visitor's OS dark preference — see globals.css's [data-zencard]
    // rules. Scoped to this subtree only; the rest of the app is unaffected.
    <div data-zencard className="flex min-h-screen flex-col bg-background text-foreground">
      <PublicNav />
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row lg:items-stretch lg:gap-8 lg:py-10">
        <ZenCardSidebar profile={profile} />

        <div className="flex min-w-0 flex-1 flex-col gap-8">
          <ZenYuktiHero bannerUrl={profile.banner_url} />
          <MetaStrip
            memberSince={profile.member_since}
            location={profile.location}
            availability={profile.availability}
            focusAreas={profile.focus_areas}
          />

          <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
            <div className="flex min-w-0 flex-1 flex-col gap-8">
              <AboutSection bio={profile.bio} />
              <SkillsSection skills={profile.skills} />
              <InterestsSection interests={profile.interests} />
              <FeaturedWorkSection items={profile.featured_work} />
            </div>

            <JourneySection entries={profile.zenyukti_journey} />
          </div>

          <ZenYuktiCTA />
        </div>
      </main>
      <Footer />
    </div>
  );
}
