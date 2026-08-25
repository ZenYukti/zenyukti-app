"use client";

import { useState } from "react";
import {
  issueInvitation,
  reissueInvitation,
  revokeInvitation,
} from "@/lib/invitation-actions";
import { StatusBadge } from "@/components/StatusBadge";
import type { CoreInvitation } from "@/lib/types";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function statusOf(inv: CoreInvitation) {
  return inv.status.toUpperCase();
}

export function InvitationsManager({
  initialInvitations,
  canManage,
}: {
  initialInvitations: CoreInvitation[];
  canManage: boolean;
}) {
  const [invitations, setInvitations] = useState(initialInvitations);
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [issuing, setIssuing] = useState(false);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [reissuingId, setReissuingId] = useState<string | null>(null);

  async function handleIssue(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIssuing(true);
    try {
      const result = await issueInvitation(email);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setInvitations((prev) => [result.invitation, ...prev]);
      setEmail("");
    } finally {
      setIssuing(false);
    }
  }

  async function handleRevoke(id: string) {
    setError(null);
    setConfirmingId(null);
    setRevokingId(id);
    try {
      const result = await revokeInvitation(id);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setInvitations((prev) =>
        prev.map((inv) => (inv.id === id ? result.invitation : inv)),
      );
    } finally {
      setRevokingId(null);
    }
  }

  async function handleReissue(inv: CoreInvitation) {
    setError(null);
    setReissuingId(inv.id);
    try {
      const result = await reissueInvitation(inv);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setInvitations((prev) => [result.invitation, ...prev]);
    } finally {
      setReissuingId(null);
    }
  }

  const pending = invitations.filter((inv) => statusOf(inv) === "PENDING");
  const history = invitations.filter((inv) => statusOf(inv) !== "PENDING");

  return (
    <div className="flex flex-col gap-10">
      {canManage && (
        <form
          onSubmit={handleIssue}
          className="flex flex-col gap-3 rounded-md border border-border p-4 sm:flex-row sm:items-end"
        >
          <div className="flex flex-1 flex-col gap-1.5">
            <label htmlFor="invite-email" className="text-sm font-medium">
              Email
            </label>
            <input
              id="invite-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="newmember@example.com"
              className="rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
            />
          </div>
          <button
            type="submit"
            disabled={issuing}
            className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:opacity-90 disabled:opacity-50"
          >
            {issuing ? "Sending…" : "Send invitation"}
          </button>
        </form>
      )}

      {error && (
        <p className="rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-500">
          {error}
        </p>
      )}

      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-medium text-muted">
          Pending ({pending.length})
        </h2>
        {pending.length === 0 ? (
          <p className="text-sm text-muted">
            No pending invitations{canManage ? " — send one above." : "."}
          </p>
        ) : (
          <div className="divide-y divide-border border-t border-border">
            {pending.map((inv) => (
              <div
                key={inv.id}
                className="flex items-center justify-between gap-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm">{inv.email}</p>
                  <p className="text-xs text-muted">
                    Expires {formatDate(inv.expires_at)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={inv.status} />
                  {canManage &&
                    (confirmingId === inv.id ? (
                      <span className="flex items-center gap-2 text-sm">
                        <span className="text-muted">Revoke?</span>
                        <button
                          onClick={() => handleRevoke(inv.id)}
                          disabled={revokingId === inv.id}
                          className="font-medium text-red-500 hover:underline disabled:opacity-50"
                        >
                          {revokingId === inv.id ? "Revoking…" : "Confirm"}
                        </button>
                        <button
                          onClick={() => setConfirmingId(null)}
                          disabled={revokingId === inv.id}
                          className="text-muted hover:text-foreground"
                        >
                          Cancel
                        </button>
                      </span>
                    ) : (
                      <button
                        onClick={() => setConfirmingId(inv.id)}
                        className="text-sm text-red-500 hover:underline"
                      >
                        Revoke
                      </button>
                    ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-medium text-muted">
          History ({history.length})
        </h2>
        {history.length === 0 ? (
          <p className="text-sm text-muted">
            Accepted, revoked, and expired invitations will show up here.
          </p>
        ) : (
          <div className="divide-y divide-border border-t border-border">
            {history.map((inv) => {
              const status = statusOf(inv);
              const canReissue =
                canManage && (status === "REVOKED" || status === "EXPIRED");
              return (
                <div
                  key={inv.id}
                  className="flex items-center justify-between gap-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm">{inv.email}</p>
                    <p className="text-xs text-muted">
                      {status === "ACCEPTED" && inv.accepted_at
                        ? `Accepted ${formatDate(inv.accepted_at)}`
                        : status === "REVOKED" && inv.revoked_at
                          ? `Revoked ${formatDate(inv.revoked_at)}`
                          : `Expired ${formatDate(inv.expires_at)}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={inv.status} />
                    {canReissue && (
                      <button
                        onClick={() => handleReissue(inv)}
                        disabled={reissuingId === inv.id}
                        className="text-sm text-accent hover:underline disabled:opacity-50"
                      >
                        {reissuingId === inv.id ? "Reissuing…" : "Reissue"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
