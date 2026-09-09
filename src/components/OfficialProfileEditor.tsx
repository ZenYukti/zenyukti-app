"use client";

import { useState } from "react";
import { setOfficialTitle, setMemberSince } from "@/lib/official-profile-actions";

const INPUT_CLASS =
  "rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent";

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

/**
 * Founder/admin-only "ZenCard / Official Profile" controls for one member:
 * official title (PATCH /v1/users/{id}/title) and Team Member Since
 * (PATCH /v1/users/{id}/member-since), both permission profiles.manage.
 * Only ever rendered when the viewer has that permission (see
 * members/[id]/page.tsx) — the backend re-checks it on every request
 * regardless.
 *
 * NOTE on memberSinceKnown: GET /v1/users/{id} does not currently return
 * member_since for another member (only the owner's own GET /v1/me/profile
 * does) — there is no existing endpoint to read it back, and this task
 * cannot add one. So "current value" is only ever known within this page
 * session, after this component itself has set it; on a fresh page load
 * the field starts blank rather than showing a stale or fabricated value.
 */
export function OfficialProfileEditor({
  userId,
  currentTitle,
}: {
  userId: string;
  currentTitle?: string;
}) {
  return (
    <div className="flex flex-col gap-6 rounded-md border border-border p-4">
      <p className="text-xs uppercase tracking-wide text-muted">
        ZenCard / Official Profile
      </p>
      <TitleField userId={userId} currentTitle={currentTitle} />
      <div className="border-t border-border pt-6">
        <MemberSinceField userId={userId} />
      </div>
    </div>
  );
}

function TitleField({
  userId,
  currentTitle,
}: {
  userId: string;
  currentTitle?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(currentTitle ?? "");
  const [saved, setSaved] = useState<string | undefined>(currentTitle);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!editing) {
    return (
      <div>
        <p className="text-sm text-muted">Official title</p>
        <div className="mt-1 flex items-center justify-between gap-3">
          <p className="text-sm font-medium">{saved || "Not set"}</p>
          <button
            type="button"
            onClick={() => {
              setTitle(saved ?? "");
              setEditing(true);
            }}
            className="shrink-0 text-sm text-accent hover:underline"
          >
            Edit official title
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        const result = await setOfficialTitle(userId, {
          title: title.trim() || null,
        });
        setSaving(false);
        if (!result.ok) {
          setError(result.error);
          return;
        }
        setSaved(result.title);
        setEditing(false);
      }}
      className="flex flex-col gap-2"
    >
      <label htmlFor="official-title" className="text-sm font-medium">
        Official title
      </label>
      <input
        id="official-title"
        type="text"
        maxLength={200}
        placeholder="e.g. Founder & Executive Head"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className={INPUT_CLASS}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-accent-foreground hover:opacity-90 disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save"}
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={() => setEditing(false)}
          className="rounded-md border border-border px-3 py-1.5 text-sm hover:bg-surface disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function MemberSinceField({ userId }: { userId: string }) {
  const [editing, setEditing] = useState(false);
  const [date, setDate] = useState("");
  const [saved, setSaved] = useState<string | undefined>(undefined);
  const [known, setKnown] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!editing) {
    return (
      <div>
        <p className="text-sm text-muted">Team Member Since</p>
        <div className="mt-1 flex items-center justify-between gap-3">
          <p className="text-sm font-medium">
            {known
              ? saved
                ? formatMemberSince(saved)
                : "Not set"
              : "Not shown here — set it below"}
          </p>
          <button
            type="button"
            onClick={() => {
              setDate(saved ?? "");
              setEditing(true);
            }}
            className="shrink-0 text-sm text-accent hover:underline"
          >
            Set Member Since
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        const result = await setMemberSince(userId, {
          member_since: date || null,
        });
        setSaving(false);
        if (!result.ok) {
          setError(result.error);
          return;
        }
        setSaved(result.memberSince);
        setKnown(true);
        setEditing(false);
      }}
      className="flex flex-col gap-2"
    >
      <label htmlFor="member-since" className="text-sm font-medium">
        Team Member Since
      </label>
      <input
        id="member-since"
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className={`w-fit ${INPUT_CLASS}`}
      />
      <p className="text-xs text-muted">
        The explicit date this member officially joined ZenYukti — never
        derived from their account creation date.
      </p>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-accent-foreground hover:opacity-90 disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save"}
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={() => setEditing(false)}
          className="rounded-md border border-border px-3 py-1.5 text-sm hover:bg-surface disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
