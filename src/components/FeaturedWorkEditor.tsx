"use client";

import { useState } from "react";
import {
  createFeaturedWork,
  updateFeaturedWork,
  deleteFeaturedWork,
} from "@/lib/featured-work-actions";
import type { CoreFeaturedWorkItem, FeaturedWorkRequest } from "@/lib/types";

const INPUT_CLASS =
  "rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent";

interface FormState {
  title: string;
  description: string;
  url: string;
  image_url: string;
  tags: string;
  date: string;
  display_order: string;
  is_public: boolean;
}

function itemToForm(item: CoreFeaturedWorkItem | null, nextOrder: number): FormState {
  return {
    title: item?.title ?? "",
    description: item?.description ?? "",
    url: item?.url ?? "",
    image_url: item?.image_url ?? "",
    tags: item?.tags.join(", ") ?? "",
    date: item?.date ?? "",
    display_order: String(item?.display_order ?? nextOrder),
    is_public: item?.is_public ?? true,
  };
}

function formToPayload(form: FormState): FeaturedWorkRequest {
  return {
    title: form.title.trim(),
    description: form.description.trim() || undefined,
    url: form.url.trim() || undefined,
    image_url: form.image_url.trim() || undefined,
    tags: form.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean),
    date: form.date.trim() || undefined,
    display_order: Number(form.display_order) || 0,
    is_public: form.is_public,
  };
}

/**
 * Member-owned Featured Work management — add/edit/delete/reorder entries
 * via the existing self-service /v1/me/featured-work endpoints. Display
 * order is authoritative and set via a plain number input (same
 * reorder-by-number convention already used by PublicTeamMembership),
 * deliberately not drag-and-drop, per the ZenCard editor spec's preference
 * for a simple, reliable interface.
 */
export function FeaturedWorkEditor({
  initialItems,
}: {
  initialItems: CoreFeaturedWorkItem[];
}) {
  const [items, setItems] = useState(
    [...initialItems].sort((a, b) => a.display_order - b.display_order),
  );
  const [editingId, setEditingId] = useState<string | "new" | null>(null);
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);

  function replaceOrAppend(item: CoreFeaturedWorkItem) {
    setItems((prev) => {
      const next = prev.some((i) => i.id === item.id)
        ? prev.map((i) => (i.id === item.id ? item : i))
        : [...prev, item];
      return next.sort((a, b) => a.display_order - b.display_order);
    });
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-wide text-muted">Featured Work</p>
        {editingId === null && (
          <button
            type="button"
            onClick={() => setEditingId("new")}
            className="text-sm text-accent hover:underline"
          >
            + Add featured work
          </button>
        )}
      </div>

      {items.length === 0 && editingId !== "new" && (
        <p className="text-sm text-muted">
          Nothing featured yet — add a project, campaign, event, or anything
          else you&apos;d like on your ZenCard.
        </p>
      )}

      <div className="flex flex-col gap-3">
        {items.map((item) =>
          editingId === item.id ? (
            <FeaturedWorkForm
              key={item.id}
              initial={item}
              nextOrder={items.length}
              onCancel={() => setEditingId(null)}
              onSaved={(saved) => {
                replaceOrAppend(saved);
                setEditingId(null);
              }}
            />
          ) : (
            <div
              key={item.id}
              className="flex items-start justify-between gap-4 rounded-md border border-border p-3"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium">{item.title}</p>
                {item.description && (
                  <p className="mt-0.5 truncate text-xs text-muted">
                    {item.description}
                  </p>
                )}
                <p className="mt-1 text-xs text-muted">
                  Order {item.display_order}
                  {!item.is_public && " · Private (hidden from public ZenCard)"}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                {confirmingDeleteId === item.id ? (
                  <DeleteConfirm
                    id={item.id}
                    onCancel={() => setConfirmingDeleteId(null)}
                    onDeleted={() => {
                      removeItem(item.id);
                      setConfirmingDeleteId(null);
                    }}
                  />
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setEditingId(item.id)}
                      className="text-sm text-accent hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmingDeleteId(item.id)}
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
          <FeaturedWorkForm
            initial={null}
            nextOrder={items.length}
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
  id,
  onCancel,
  onDeleted,
}: {
  id: string;
  onCancel: () => void;
  onDeleted: () => void;
}) {
  const [removing, setRemoving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex flex-col items-end gap-1.5">
      <p className="max-w-[16rem] text-right text-xs text-muted">
        This only removes this Featured Work entry from your ZenCard.
      </p>
      {error && <p className="text-xs text-red-500">{error}</p>}
      <div className="flex items-center gap-3">
        <button
          type="button"
          disabled={removing}
          onClick={async () => {
            setRemoving(true);
            setError(null);
            const result = await deleteFeaturedWork(id);
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

function FeaturedWorkForm({
  initial,
  nextOrder,
  onCancel,
  onSaved,
}: {
  initial: CoreFeaturedWorkItem | null;
  nextOrder: number;
  onCancel: () => void;
  onSaved: (item: CoreFeaturedWorkItem) => void;
}) {
  const [form, setForm] = useState<FormState>(() => itemToForm(initial, nextOrder));
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
      ? await updateFeaturedWork(initial.id, payload)
      : await createFeaturedWork(payload);

    setSaving(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    onSaved(result.item);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 rounded-md border border-accent/40 bg-surface p-4"
    >
      <div className="flex flex-col gap-1.5">
        <label htmlFor="fw-title" className="text-sm font-medium">
          Title
        </label>
        <input
          id="fw-title"
          type="text"
          required
          maxLength={150}
          value={form.title}
          onChange={(e) => update("title", e.target.value)}
          className={INPUT_CLASS}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="fw-description" className="text-sm font-medium">
          Description
        </label>
        <textarea
          id="fw-description"
          rows={2}
          maxLength={1000}
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
          className={INPUT_CLASS}
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="fw-url" className="text-sm font-medium">
            Project/work URL
          </label>
          <input
            id="fw-url"
            type="url"
            placeholder="https://…"
            maxLength={2048}
            value={form.url}
            onChange={(e) => update("url", e.target.value)}
            className={INPUT_CLASS}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="fw-image" className="text-sm font-medium">
            Image URL
          </label>
          <input
            id="fw-image"
            type="url"
            placeholder="https://…"
            maxLength={2048}
            value={form.image_url}
            onChange={(e) => update("image_url", e.target.value)}
            className={INPUT_CLASS}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="fw-tags" className="text-sm font-medium">
            Tags
          </label>
          <input
            id="fw-tags"
            type="text"
            placeholder="Comma-separated, e.g. Community, Design"
            value={form.tags}
            onChange={(e) => update("tags", e.target.value)}
            className={INPUT_CLASS}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="fw-date" className="text-sm font-medium">
            Work date
          </label>
          <input
            id="fw-date"
            type="text"
            placeholder="e.g. 2026 or March 2026"
            maxLength={50}
            value={form.date}
            onChange={(e) => update("date", e.target.value)}
            className={INPUT_CLASS}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="fw-order" className="text-sm font-medium">
            Display order
          </label>
          <input
            id="fw-order"
            type="number"
            value={form.display_order}
            onChange={(e) => update("display_order", e.target.value)}
            className={`w-24 ${INPUT_CLASS}`}
          />
        </div>
        <label className="flex items-center gap-2 pb-2 text-sm">
          <input
            type="checkbox"
            checked={form.is_public}
            onChange={(e) => update("is_public", e.target.checked)}
            className="h-4 w-4 rounded border-border"
          />
          Visible on public ZenCard
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
          {saving ? "Saving…" : initial ? "Save changes" : "Add featured work"}
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
