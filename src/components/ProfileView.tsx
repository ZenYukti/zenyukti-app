"use client";

import { useState } from "react";
import { apiFetch, ApiError } from "@/lib/api";
import { createClient } from "@/lib/supabase/client";
import type { CoreProfile } from "@/lib/types";

const EDITABLE_FIELDS: {
  key: keyof CoreProfile;
  label: string;
  placeholder?: string;
}[] = [
  { key: "display_name", label: "Display name" },
  { key: "title", label: "Title / role" },
  { key: "bio", label: "Bio" },
  { key: "avatar_url", label: "Avatar URL" },
  { key: "github", label: "GitHub", placeholder: "https://github.com/…" },
  { key: "linkedin", label: "LinkedIn", placeholder: "https://linkedin.com/in/…" },
  { key: "website", label: "Website" },
];

type FormState = Record<string, string>;

function profileToForm(profile: CoreProfile | null): FormState {
  const state: FormState = {};
  for (const { key } of EDITABLE_FIELDS) {
    const value = profile?.[key];
    state[key] = typeof value === "string" ? value : "";
  }
  state.skills = profile?.skills?.join(", ") ?? "";
  return state;
}

export function ProfileView({
  initialProfile,
  email,
}: {
  initialProfile: CoreProfile | null;
  email: string;
}) {
  const [profile, setProfile] = useState(initialProfile);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<FormState>(() => profileToForm(initialProfile));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function startEditing() {
    setForm(profileToForm(profile));
    setError(null);
    setEditing(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const payload: Partial<CoreProfile> = {
      display_name: form.display_name || undefined,
      title: form.title || undefined,
      bio: form.bio || undefined,
      avatar_url: form.avatar_url || undefined,
      github: form.github || undefined,
      linkedin: form.linkedin || undefined,
      website: form.website || undefined,
      skills: form.skills
        ? form.skills.split(",").map((s) => s.trim()).filter(Boolean)
        : undefined,
    };

    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const updated = await apiFetch<CoreProfile>("/v1/me/profile", session?.access_token ?? null, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
      setProfile(updated);
      setEditing(false);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.detail || err.message
          : "Failed to save profile.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (editing) {
    return (
      <form onSubmit={handleSave} className="flex flex-col gap-4">
        {EDITABLE_FIELDS.map(({ key, label, placeholder }) => (
          <div key={key} className="flex flex-col gap-1.5">
            <label htmlFor={key} className="text-sm font-medium">
              {label}
            </label>
            {key === "bio" ? (
              <textarea
                id={key}
                rows={3}
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                className="rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
              />
            ) : (
              <input
                id={key}
                type="text"
                value={form[key]}
                placeholder={placeholder}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                className="rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
              />
            )}
          </div>
        ))}

        <div className="flex flex-col gap-1.5">
          <label htmlFor="skills" className="text-sm font-medium">
            Skills
          </label>
          <input
            id="skills"
            type="text"
            value={form.skills}
            placeholder="Comma-separated, e.g. Go, React, Postgres"
            onChange={(e) => setForm({ ...form, skills: e.target.value })}
            className="rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
          />
        </div>

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

  const displayName = profile?.display_name || profile?.name || email;

  return (
    <div className="flex flex-col gap-6">
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
          </div>
        </div>
        <button
          onClick={startEditing}
          className="shrink-0 rounded-md border border-border px-3 py-1.5 text-sm hover:bg-surface"
        >
          Edit profile
        </button>
      </div>

      {profile?.bio && <p className="text-sm leading-relaxed">{profile.bio}</p>}

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
          <a
            href={profile.github}
            target="_blank"
            rel="noreferrer"
            className="text-accent hover:underline"
          >
            GitHub
          </a>
        )}
        {profile?.linkedin && (
          <a
            href={profile.linkedin}
            target="_blank"
            rel="noreferrer"
            className="text-accent hover:underline"
          >
            LinkedIn
          </a>
        )}
        {profile?.website && (
          <a
            href={profile.website}
            target="_blank"
            rel="noreferrer"
            className="text-accent hover:underline"
          >
            Website
          </a>
        )}
      </div>

      {!profile && (
        <p className="text-sm text-muted">
          No profile data yet — click Edit profile to add yours.
        </p>
      )}
    </div>
  );
}
