"use client";

import { useState } from "react";
import Link from "next/link";
import { updateProfile } from "@/lib/profile-actions";
import { profileCompleteness } from "@/lib/profile";
import { AvatarUpload } from "@/components/AvatarUpload";
import { BannerUpload } from "@/components/BannerUpload";
import { CopyButton } from "@/components/CopyButton";
import type { CoreProfile, ProfileSocials } from "@/lib/types";

/** The interactive app.zenyukti.in/u/<username> control — same shape in
 * both the edit-mode preview and the read-mode display, per spec. */
function PublicProfileUrl({
  username,
  className = "",
}: {
  username: string;
  className?: string;
}) {
  const path = `/u/${username}`;
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <Link
        href={path}
        target="_blank"
        rel="noreferrer"
        className="min-w-0 truncate font-mono text-xs text-accent hover:underline"
      >
        app.zenyukti.in{path}
      </Link>
      <CopyButton value={`https://app.zenyukti.in${path}`} />
    </div>
  );
}

const SOCIAL_FIELDS: { key: keyof ProfileSocials; label: string; placeholder: string }[] = [
  { key: "github", label: "GitHub", placeholder: "https://github.com/…" },
  { key: "linkedin", label: "LinkedIn", placeholder: "https://linkedin.com/in/…" },
  { key: "x", label: "X (Twitter)", placeholder: "https://x.com/…" },
  { key: "instagram", label: "Instagram", placeholder: "https://instagram.com/…" },
  { key: "website", label: "Website", placeholder: "https://…" },
];

function formatMemberSince(iso: string): string | null {
  const match = /^(\d{4})-(\d{2})-\d{2}$/.exec(iso);
  if (!match) return null;
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  const name = months[Number(match[2]) - 1];
  return name ? `${name} ${match[1]}` : null;
}

interface FormState {
  display_name: string;
  username: string;
  bio: string;
  quote: string;
  avatar_url: string;
  banner_url: string;
  location: string;
  availability: string;
  focus_areas: string;
  interests: string;
  github: string;
  linkedin: string;
  x: string;
  instagram: string;
  website: string;
  skills: string;
  is_public: boolean;
}

function profileToForm(profile: CoreProfile | null, fallbackName: string): FormState {
  return {
    display_name: profile?.display_name ?? fallbackName,
    username: profile?.username ?? "",
    bio: profile?.bio ?? "",
    quote: profile?.quote ?? "",
    avatar_url: profile?.avatar_url ?? "",
    banner_url: profile?.banner_url ?? "",
    location: profile?.location ?? "",
    availability: profile?.availability ?? "",
    focus_areas: profile?.focus_areas.join(", ") ?? "",
    interests: profile?.interests.join(", ") ?? "",
    github: profile?.socials.github ?? "",
    linkedin: profile?.socials.linkedin ?? "",
    x: profile?.socials.x ?? "",
    instagram: profile?.socials.instagram ?? "",
    website: profile?.socials.website ?? "",
    skills: profile?.skills.join(", ") ?? "",
    is_public: profile?.is_public ?? false,
  };
}

function splitList(value: string): string[] {
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

const INPUT_CLASS =
  "rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent";

const GROUP_LABEL_CLASS = "text-xs uppercase tracking-wide text-muted";

export function ProfileView({
  initialProfile,
  email,
  authUserId,
}: {
  initialProfile: CoreProfile | null;
  email: string;
  authUserId: string;
}) {
  const [profile, setProfile] = useState(initialProfile);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<FormState>(() =>
    profileToForm(initialProfile, email),
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function startEditing() {
    setForm(profileToForm(profile, email));
    setError(null);
    setSaved(false);
    setEditing(true);
  }

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const socials: ProfileSocials = {};
    for (const { key } of SOCIAL_FIELDS) {
      if (form[key]) socials[key] = form[key];
    }

    const result = await updateProfile({
      display_name: form.display_name,
      username: form.username || undefined,
      avatar_url: form.avatar_url || undefined,
      banner_url: form.banner_url || null,
      bio: form.bio || undefined,
      quote: form.quote || undefined,
      location: form.location || undefined,
      availability: form.availability || undefined,
      focus_areas: splitList(form.focus_areas),
      interests: splitList(form.interests),
      socials,
      skills: splitList(form.skills),
      is_public: form.is_public,
    });

    setSaving(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setProfile(result.profile);
    setEditing(false);
    setSaved(true);
  }

  const displayName = profile?.display_name || email;
  const stats = profile ? profileCompleteness(profile) : null;
  const memberSince = profile?.member_since
    ? formatMemberSince(profile.member_since)
    : null;

  if (editing) {
    return (
      <form onSubmit={handleSave} className="flex flex-col gap-6">
        <AvatarUpload
          authUserId={authUserId}
          displayName={form.display_name || email}
          avatarUrl={form.avatar_url || null}
          onChange={(url) => updateField("avatar_url", url ?? "")}
        />
        <BannerUpload
          authUserId={authUserId}
          bannerUrl={form.banner_url || null}
          onChange={(url) => updateField("banner_url", url ?? "")}
        />

        {/* Official title and Team Member Since are ZenYukti-controlled —
            never editable here. Only shown, never offered as inputs, so a
            member can see their own official identity without being able
            to change it (see OfficialProfileEditor for the Founder-only
            write path). */}
        {(profile?.title || memberSince) && (
          <div className="flex flex-col gap-1 rounded-md border border-border bg-surface px-3 py-2.5 text-sm">
            {profile?.title && (
              <p>
                <span className="text-muted">Official title: </span>
                {profile.title}
              </p>
            )}
            {memberSince && (
              <p>
                <span className="text-muted">Team Member Since: </span>
                {memberSince}
              </p>
            )}
            <p className="text-xs text-muted">
              Set by a ZenYukti Founder — not editable here.
            </p>
          </div>
        )}

        <div className="flex flex-col gap-4">
          <p className={GROUP_LABEL_CLASS}>Profile information</p>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="display_name" className="text-sm font-medium">
              Display name
            </label>
            <input
              id="display_name"
              type="text"
              required
              value={form.display_name}
              onChange={(e) => updateField("display_name", e.target.value)}
              className={INPUT_CLASS}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="username" className="text-sm font-medium">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={form.username}
              onChange={(e) => updateField("username", e.target.value)}
              placeholder="e.g. nomad_42"
              className={INPUT_CLASS}
            />
            <p className="text-xs text-muted">
              3-30 characters: lowercase letters, numbers, and underscores,
              starting with a letter. This becomes your public ZenYukti URL.
            </p>
            {form.username && (
              <PublicProfileUrl
                username={form.username}
                className="rounded-md border border-border bg-surface px-3 py-2"
              />
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="bio" className="text-sm font-medium">
              Bio
            </label>
            <textarea
              id="bio"
              rows={3}
              maxLength={1000}
              value={form.bio}
              onChange={(e) => updateField("bio", e.target.value)}
              className={INPUT_CLASS}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="quote" className="text-sm font-medium">
              Quote
            </label>
            <textarea
              id="quote"
              rows={2}
              maxLength={300}
              placeholder="A short personal quote for your ZenCard sidebar"
              value={form.quote}
              onChange={(e) => updateField("quote", e.target.value)}
              className={INPUT_CLASS}
            />
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-border pt-4">
          <p className={GROUP_LABEL_CLASS}>Professional details</p>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="location" className="text-sm font-medium">
                Location
              </label>
              <input
                id="location"
                type="text"
                maxLength={100}
                placeholder="e.g. Delhi, India"
                value={form.location}
                onChange={(e) => updateField("location", e.target.value)}
                className={INPUT_CLASS}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="availability" className="text-sm font-medium">
                Availability
              </label>
              <input
                id="availability"
                type="text"
                maxLength={100}
                placeholder="e.g. Open to Collaborate"
                value={form.availability}
                onChange={(e) => updateField("availability", e.target.value)}
                className={INPUT_CLASS}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="focus_areas" className="text-sm font-medium">
              Focus areas
            </label>
            <input
              id="focus_areas"
              type="text"
              placeholder="Comma-separated, e.g. Community, Design, Technology"
              value={form.focus_areas}
              onChange={(e) => updateField("focus_areas", e.target.value)}
              className={INPUT_CLASS}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="interests" className="text-sm font-medium">
              Interests
            </label>
            <input
              id="interests"
              type="text"
              placeholder="Comma-separated, e.g. Open Source, Education, AI"
              value={form.interests}
              onChange={(e) => updateField("interests", e.target.value)}
              className={INPUT_CLASS}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="skills" className="text-sm font-medium">
              Skills
            </label>
            <input
              id="skills"
              type="text"
              value={form.skills}
              placeholder="Comma-separated, e.g. Go, React, Postgres"
              onChange={(e) => updateField("skills", e.target.value)}
              className={INPUT_CLASS}
            />
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-border pt-4">
          <p className={GROUP_LABEL_CLASS}>Social links</p>
          {SOCIAL_FIELDS.map(({ key, label, placeholder }) => (
            <div key={key} className="flex flex-col gap-1.5">
              <label htmlFor={key} className="text-sm font-medium">
                {label}
              </label>
              <input
                id={key}
                type="text"
                value={form[key]}
                placeholder={placeholder}
                onChange={(e) => updateField(key, e.target.value)}
                className={INPUT_CLASS}
              />
            </div>
          ))}
        </div>

        <label className="flex items-start gap-2.5 border-t border-border pt-4 text-sm">
          <input
            type="checkbox"
            checked={form.is_public}
            onChange={(e) => updateField("is_public", e.target.checked)}
            className="mt-0.5"
          />
          <span>
            Make my profile visible to other ZenYukti members
            <span className="block text-xs text-muted">
              When off, only you can see this information — teammates will
              still see your email and status in the member directory.
            </span>
          </span>
        </label>

        {error && (
          <p className="rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-500">
            {error}
          </p>
        )}

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-accent px-3 py-2 text-sm font-medium text-accent-foreground hover:opacity-90 disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
          <button
            type="button"
            onClick={() => setEditing(false)}
            disabled={saving}
            className="rounded-md border border-border px-3 py-2 text-sm hover:bg-surface"
          >
            Cancel
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {saved && (
        <p className="rounded-md bg-emerald-500/10 px-3 py-2 text-sm text-emerald-600 dark:text-emerald-400">
          Profile saved.
        </p>
      )}

      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          {profile?.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.avatar_url}
              alt={displayName}
              className="h-14 w-14 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-surface text-lg font-medium text-muted">
              {displayName.slice(0, 1).toUpperCase()}
            </div>
          )}
          <div>
            <h2 className="text-lg font-semibold">{displayName}</h2>
            {profile?.title && (
              <p className="text-sm text-muted">{profile.title}</p>
            )}
            <p className="text-sm text-muted">{email}</p>
            {profile?.username && (
              <PublicProfileUrl username={profile.username} className="mt-1" />
            )}
          </div>
        </div>
        <button
          onClick={startEditing}
          className="shrink-0 rounded-md border border-border px-3 py-1.5 text-sm hover:bg-surface"
        >
          Edit profile
        </button>
      </div>

      {memberSince && (
        <p className="text-xs text-muted">Team Member Since {memberSince}</p>
      )}

      {profile?.bio && <p className="text-sm leading-relaxed">{profile.bio}</p>}

      {profile?.quote && (
        <p className="border-l-2 border-accent/40 pl-3 text-sm italic leading-relaxed text-foreground/80">
          &ldquo;{profile.quote}&rdquo;
        </p>
      )}

      {profile && (profile.location || profile.availability) && (
        <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted">
          {profile.location && <span>📍 {profile.location}</span>}
          {profile.availability && <span>{profile.availability}</span>}
        </div>
      )}

      {profile && profile.focus_areas.length > 0 && (
        <div>
          <p className="mb-2 text-xs uppercase tracking-wide text-muted">
            Focus areas
          </p>
          <div className="flex flex-wrap gap-2">
            {profile.focus_areas.map((area) => (
              <span
                key={area}
                className="rounded-full bg-surface px-2.5 py-1 text-xs"
              >
                {area}
              </span>
            ))}
          </div>
        </div>
      )}

      {profile && profile.interests.length > 0 && (
        <div>
          <p className="mb-2 text-xs uppercase tracking-wide text-muted">
            Interests
          </p>
          <div className="flex flex-wrap gap-2">
            {profile.interests.map((interest) => (
              <span
                key={interest}
                className="rounded-full bg-surface px-2.5 py-1 text-xs"
              >
                {interest}
              </span>
            ))}
          </div>
        </div>
      )}

      {profile && profile.skills.length > 0 && (
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

      {profile && Object.values(profile.socials).some(Boolean) && (
        <div className="flex flex-wrap gap-4 text-sm">
          {SOCIAL_FIELDS.map(
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

      {profile && (
        <div className="flex flex-col gap-1.5 border-t border-border pt-4">
          {stats && (
            <div className="flex items-center gap-3">
              <div
                role="progressbar"
                aria-label="Profile completeness"
                aria-valuenow={stats.percent}
                aria-valuemin={0}
                aria-valuemax={100}
                className="h-1.5 flex-1 rounded-full bg-border"
              >
                <div
                  className="h-1.5 rounded-full bg-accent"
                  style={{ width: `${stats.percent}%` }}
                />
              </div>
              <span className="text-sm tabular-nums text-muted">
                {stats.percent}%
              </span>
            </div>
          )}
          <p className="text-xs text-muted">
            {stats && stats.missing.length > 0
              ? `Add ${stats.missing.join(", ")} to complete your profile. `
              : ""}
            {profile.is_public
              ? "Visible to other ZenYukti members."
              : "Only visible to you."}
          </p>
        </div>
      )}

      {!profile && (
        <p className="text-sm text-muted">
          You haven&apos;t set up your profile yet — click Edit profile to
          add yours.
        </p>
      )}
    </div>
  );
}
