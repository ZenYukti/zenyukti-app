import type { CoreProfile, ProfileSocials } from "@/lib/types";

/** Display labels for each social link key, in the order they should render. */
export const SOCIAL_LABELS: { key: keyof ProfileSocials; label: string }[] = [
  { key: "github", label: "GitHub" },
  { key: "linkedin", label: "LinkedIn" },
  { key: "x", label: "X (Twitter)" },
  { key: "instagram", label: "Instagram" },
  { key: "website", label: "Website" },
];

const PROFILE_FIELDS: {
  key: "display_name" | "avatar_url" | "bio" | "title";
  label: string;
}[] = [
  { key: "display_name", label: "display name" },
  { key: "avatar_url", label: "avatar" },
  { key: "bio", label: "bio" },
  { key: "title", label: "title" },
];

function hasSocialLink(socials: ProfileSocials) {
  return Boolean(
    socials.github ||
      socials.linkedin ||
      socials.x ||
      socials.instagram ||
      socials.website,
  );
}

export function profileCompleteness(profile: CoreProfile) {
  const checks = [
    ...PROFILE_FIELDS.map((f) => ({
      label: f.label,
      filled: Boolean(profile[f.key]),
    })),
    { label: "a social link", filled: hasSocialLink(profile.socials) },
    { label: "skills", filled: profile.skills.length > 0 },
  ];
  const missing = checks.filter((c) => !c.filled).map((c) => c.label);
  return {
    percent: Math.round(((checks.length - missing.length) / checks.length) * 100),
    missing,
  };
}
