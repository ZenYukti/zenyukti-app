"use client";

import { useState } from "react";
import { updatePublicTeamMembership } from "@/lib/public-team-actions";
import type { PublicTeamMember } from "@/lib/types";

/**
 * Public Core Team roster control on a member's detail page. Deliberately
 * separate from standing_role/roles rendered elsewhere on this page — the
 * backend keeps Founder/ZenCrew/ZenMate independent of public Core Team
 * listing, and this component never reads or derives from either.
 */
export function PublicTeamMembership({
  memberId,
  initialPublicTeamMember,
  canManage,
}: {
  memberId: string;
  initialPublicTeamMember: PublicTeamMember | null | undefined;
  canManage: boolean;
}) {
  const [publicTeamMember, setPublicTeamMember] = useState(
    initialPublicTeamMember ?? null,
  );
  const [listed, setListed] = useState(Boolean(initialPublicTeamMember?.listed));
  const [displayOrder, setDisplayOrder] = useState(
    String(initialPublicTeamMember?.display_order ?? 0),
  );
  const [saving, setSaving] = useState(false);
  const [confirmingRemove, setConfirmingRemove] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dirty =
    listed !== Boolean(publicTeamMember?.listed) ||
    (listed && Number(displayOrder) !== (publicTeamMember?.display_order ?? 0));

  function applyResult(next: PublicTeamMember | null) {
    setPublicTeamMember(next);
    setListed(Boolean(next?.listed));
    setDisplayOrder(String(next?.display_order ?? 0));
  }

  async function handleSave() {
    setError(null);
    setSaving(true);
    try {
      const result = listed
        ? await updatePublicTeamMembership(memberId, {
            listed: true,
            display_order: Number(displayOrder) || 0,
          })
        : await updatePublicTeamMembership(memberId, { listed: false });

      if (!result.ok) {
        setError(result.error);
        return;
      }
      applyResult(result.publicTeamMember);
    } finally {
      setSaving(false);
    }
  }

  async function handleRemove() {
    setError(null);
    setRemoving(true);
    try {
      const result = await updatePublicTeamMembership(memberId, {
        listed: false,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      applyResult(result.publicTeamMember);
      setConfirmingRemove(false);
    } finally {
      setRemoving(false);
    }
  }

  if (!canManage) {
    return (
      <div>
        <p className="mb-2 text-xs uppercase tracking-wide text-muted">
          Public Core Team
        </p>
        <p className="text-sm">
          {publicTeamMember?.listed
            ? `Listed on public People page (order ${publicTeamMember.display_order})`
            : "Not listed on public People page"}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border border-border p-4">
      <p className="mb-3 text-xs uppercase tracking-wide text-muted">
        Public Core Team
      </p>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={listed}
          onChange={(e) => setListed(e.target.checked)}
          className="h-4 w-4 rounded border-border"
        />
        Listed on public People page
      </label>

      {listed && (
        <div className="mt-3 flex items-center gap-2">
          <label htmlFor="display-order" className="text-sm text-muted">
            Display order
          </label>
          <input
            id="display-order"
            type="number"
            value={displayOrder}
            onChange={(e) => setDisplayOrder(e.target.value)}
            className="w-20 rounded-md border border-border bg-background px-2 py-1 text-sm outline-none focus:border-accent"
          />
        </div>
      )}

      <div className="mt-3 flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving || removing || !dirty}
          className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:opacity-90 disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </div>

      {error && (
        <p className="mt-3 rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-500">
          {error}
        </p>
      )}

      {publicTeamMember?.listed && (
        <div className="mt-4 border-t border-border pt-3">
          {confirmingRemove ? (
            <div className="flex flex-col gap-2">
              <p className="text-sm text-muted">
                Remove this member from the public People page? This only
                removes them from the public People page — it does not
                delete their account, profile, or role.
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleRemove}
                  disabled={removing}
                  className="rounded-md border border-red-500/40 px-3 py-1.5 text-sm font-medium text-red-500 hover:bg-red-500/10 disabled:opacity-50"
                >
                  {removing ? "Removing…" : "Confirm removal"}
                </button>
                <button
                  onClick={() => setConfirmingRemove(false)}
                  disabled={removing}
                  className="text-sm text-muted hover:text-foreground disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setConfirmingRemove(true)}
              disabled={saving || removing}
              className="rounded-md border border-red-500/40 px-3 py-1.5 text-sm font-medium text-red-500 hover:bg-red-500/10 disabled:opacity-50"
            >
              Remove from public People page
            </button>
          )}
        </div>
      )}
    </div>
  );
}
