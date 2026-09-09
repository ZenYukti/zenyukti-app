"use client";

import { useState } from "react";
import {
  createJourneyEntry,
  updateJourneyEntry,
  deleteJourneyEntry,
} from "@/lib/journey-actions";
import type { CoreJourneyEntry, JourneyEntryRequest } from "@/lib/types";

const INPUT_CLASS =
  "rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent";

// Suggested values only — icon is free text on the backend (see
// journey_entries.sql), matched loosely by the public page's own icon map
// (src/components/zencard/icons.tsx). Offered via a datalist so an admin
// isn't guessing at spelling, but any value is still accepted.
const SUGGESTED_ICONS = [
  "joined",
  "role",
  "milestone",
  "launch",
  "community",
  "growth",
  "present",
];

interface FormState {
  title: string;
  description: string;
  date: string;
  icon: string;
  display_order: string;
  is_published: boolean;
}

function entryToForm(entry: CoreJourneyEntry | null, nextOrder: number): FormState {
  return {
    title: entry?.title ?? "",
    description: entry?.description ?? "",
    date: entry?.date ?? "",
    icon: entry?.icon ?? "",
    display_order: String(entry?.display_order ?? nextOrder),
    is_published: entry?.is_published ?? true,
  };
}

function formToPayload(form: FormState): JourneyEntryRequest {
  return {
    title: form.title.trim(),
    description: form.description.trim() || undefined,
    date: form.date.trim() || undefined,
    icon: form.icon.trim() || undefined,
    display_order: Number(form.display_order) || 0,
    is_published: form.is_published,
  };
}

/**
 * Founder/admin-only ZenYukti Journey management for one member — add/
 * edit/delete/reorder entries via /v1/users/{id}/journey. Only ever
 * rendered when the viewer has journey.manage (see members/[id]/page.tsx);
 * the backend is the real authority and re-checks this on every request
 * regardless. Reorder is a plain display_order number input, same
 * convention as Featured Work and PublicTeamMembership — no drag-and-drop.
 */
export function JourneyEditor({
  userId,
  initialEntries,
}: {
  userId: string;
  initialEntries: CoreJourneyEntry[];
}) {
  const [entries, setEntries] = useState(
    [...initialEntries].sort((a, b) => a.display_order - b.display_order),
  );
  const [editingId, setEditingId] = useState<string | "new" | null>(null);
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);

  function replaceOrAppend(entry: CoreJourneyEntry) {
    setEntries((prev) => {
      const next = prev.some((e) => e.id === entry.id)
        ? prev.map((e) => (e.id === entry.id ? entry : e))
        : [...prev, entry];
      return next.sort((a, b) => a.display_order - b.display_order);
    });
  }

  function removeEntry(id: string) {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }

  return (
    <div className="flex flex-col gap-4 rounded-md border border-border p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-wide text-muted">
          ZenYukti Journey
        </p>
        {editingId === null && (
          <button
            type="button"
            onClick={() => setEditingId("new")}
            className="text-sm text-accent hover:underline"
          >
            + Add journey entry
          </button>
        )}
      </div>

      {entries.length === 0 && editingId !== "new" && (
        <p className="text-sm text-muted">
          No journey entries yet — this member&apos;s public ZenCard won&apos;t
          show a Journey section until one exists.
        </p>
      )}

      <div className="flex flex-col gap-3">
        {entries.map((entry) =>
          editingId === entry.id ? (
            <JourneyForm
              key={entry.id}
              initial={entry}
              nextOrder={entries.length}
              userId={userId}
              onCancel={() => setEditingId(null)}
              onSaved={(saved) => {
                replaceOrAppend(saved);
                setEditingId(null);
              }}
            />
          ) : (
            <div
              key={entry.id}
              className="flex items-start justify-between gap-4 rounded-md border border-border p-3"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium">{entry.title}</p>
                {entry.description && (
                  <p className="mt-0.5 truncate text-xs text-muted">
                    {entry.description}
                  </p>
                )}
                <p className="mt-1 text-xs text-muted">
                  {entry.date ? `${entry.date} · ` : ""}Order {entry.display_order}
                  {!entry.is_published && " · Draft (hidden from public ZenCard)"}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                {confirmingDeleteId === entry.id ? (
                  <DeleteConfirm
                    userId={userId}
                    entryId={entry.id}
                    onCancel={() => setConfirmingDeleteId(null)}
                    onDeleted={() => {
                      removeEntry(entry.id);
                      setConfirmingDeleteId(null);
                    }}
                  />
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setEditingId(entry.id)}
                      className="text-sm text-accent hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmingDeleteId(entry.id)}
                      className="text-sm text-red-500 hover:underline"
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          ),
        )}

        {editingId === "new" && (
          <JourneyForm
            initial={null}
            nextOrder={entries.length}
            userId={userId}
            onCancel={() => setEditingId(null)}
            onSaved={(saved) => {
              replaceOrAppend(saved);
              setEditingId(null);
            }}
          />
        )}
      </div>
    </div>
  );
}

function DeleteConfirm({
  userId,
  entryId,
  onCancel,
  onDeleted,
}: {
  userId: string;
  entryId: string;
  onCancel: () => void;
  onDeleted: () => void;
}) {
  const [removing, setRemoving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex flex-col items-end gap-1.5">
      <p className="max-w-[16rem] text-right text-xs text-muted">
        This removes this entry from the member&apos;s public ZenYukti
        Journey timeline.
      </p>
      {error && <p className="text-xs text-red-500">{error}</p>}
      <div className="flex items-center gap-3">
        <button
          type="button"
          disabled={removing}
          onClick={async () => {
            setRemoving(true);
            setError(null);
            const result = await deleteJourneyEntry(userId, entryId);
            setRemoving(false);
            if (!result.ok) {
              setError(result.error);
              return;
            }
            onDeleted();
          }}
          className="text-sm font-medium text-red-500 hover:underline disabled:opacity-50"
        >
          {removing ? "Removing…" : "Confirm removal"}
        </button>
        <button
          type="button"
          disabled={removing}
          onClick={onCancel}
          className="text-sm text-muted hover:text-foreground disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

function JourneyForm({
  initial,
  nextOrder,
  userId,
  onCancel,
  onSaved,
}: {
  initial: CoreJourneyEntry | null;
  nextOrder: number;
  userId: string;
  onCancel: () => void;
  onSaved: (entry: CoreJourneyEntry) => void;
}) {
  const [form, setForm] = useState<FormState>(() => entryToForm(initial, nextOrder));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const payload = formToPayload(form);
    const result = initial
      ? await updateJourneyEntry(userId, initial.id, payload)
      : await createJourneyEntry(userId, payload);

    setSaving(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    onSaved(result.entry);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 rounded-md border border-accent/40 bg-surface p-4"
    >
      <div className="flex flex-col gap-1.5">
        <label htmlFor="je-title" className="text-sm font-medium">
          Title
        </label>
        <input
          id="je-title"
          type="text"
          required
          maxLength={150}
          value={form.title}
          onChange={(e) => update("title", e.target.value)}
          className={INPUT_CLASS}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="je-description" className="text-sm font-medium">
          Description
        </label>
        <textarea
          id="je-description"
          rows={2}
          maxLength={1000}
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
          className={INPUT_CLASS}
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="je-date" className="text-sm font-medium">
            Entry date
          </label>
          <input
            id="je-date"
            type="text"
            placeholder="e.g. Sep 2026 or Present"
            maxLength={50}
            value={form.date}
            onChange={(e) => update("date", e.target.value)}
            className={INPUT_CLASS}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="je-icon" className="text-sm font-medium">
            Icon
          </label>
          <input
            id="je-icon"
            list="journey-icon-suggestions"
            type="text"
            maxLength={50}
            value={form.icon}
            onChange={(e) => update("icon", e.target.value)}
            className={INPUT_CLASS}
          />
          <datalist id="journey-icon-suggestions">
            {SUGGESTED_ICONS.map((icon) => (
              <option key={icon} value={icon} />
            ))}
          </datalist>
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="je-order" className="text-sm font-medium">
            Display order
          </label>
          <input
            id="je-order"
            type="number"
            value={form.display_order}
            onChange={(e) => update("display_order", e.target.value)}
            className={`w-24 ${INPUT_CLASS}`}
          />
        </div>
        <label className="flex items-center gap-2 pb-2 text-sm">
          <input
            type="checkbox"
            checked={form.is_published}
            onChange={(e) => update("is_published", e.target.checked)}
            className="h-4 w-4 rounded border-border"
          />
          Published (visible on public ZenCard)
        </label>
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
          {saving ? "Saving…" : initial ? "Save changes" : "Add journey entry"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="rounded-md border border-border px-3 py-2 text-sm hover:bg-surface disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
