import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { PublicNav } from "@/components/zencard/PublicNav";
import { ZenCardSidebar } from "@/components/zencard/ZenCardSidebar";
import { ZenYuktiHero } from "@/components/zencard/ZenYuktiHero";
import { AboutSection } from "@/components/zencard/AboutSection";
import { SkillsSection } from "@/components/zencard/SkillsSection";
import { ZenYuktiCTA } from "@/components/zencard/ZenYuktiCTA";
import { Footer } from "@/components/zencard/Footer";
import type { CorePublicProfile } from "@/lib/types";

const MAX_DESCRIPTION_LENGTH = 160;

// Public, unauthenticated route (see PUBLIC_PATHS in
// src/lib/supabase/middleware.ts) — fetched server-side via apiFetch(path,
// null), same pattern as the invitation lookup flow, since zenyukti-os has
// no CORS support for a direct browser call. Next automatically memoizes
// identical fetch() calls within one render pass, so calling this from
// both generateMetadata and the page below only hits the network once.
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
    <div className="flex min-h-screen flex-col bg-background">
      <PublicNav />
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6 lg:flex-row lg:items-start lg:gap-10 lg:py-12">
        <ZenCardSidebar profile={profile} />
        <div className="flex min-w-0 flex-1 flex-col gap-10">
          <ZenYuktiHero />
          <AboutSection bio={profile.bio} />
          <SkillsSection skills={profile.skills} />
          <ZenYuktiCTA />
        </div>
      </main>
      <Footer />
    </div>
  );
}
