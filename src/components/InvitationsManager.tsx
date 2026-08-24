"use client";

import { useState } from "react";
import { issueInvitation, revokeInvitation } from "@/lib/invitation-actions";
import { StatusBadge } from "@/components/StatusBadge";
import type { CoreInvitation } from "@/lib/types";

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
  const [revokingId, setRevokingId] = useState<string | null>(null);

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

  return (
    <div className="flex flex-col gap-8">
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

      {invitations.length === 0 ? (
        <p className="text-sm text-muted">No invitations to show.</p>
      ) : (
        <div className="divide-y divide-border border-t border-border">
          {invitations.map((inv) => (
            <div
              key={inv.id}
              className="flex items-center justify-between gap-4 py-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm">{inv.email}</p>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={inv.status} />
                {canManage && inv.status.toUpperCase() === "PENDING" && (
                  <button
                    onClick={() => handleRevoke(inv.id)}
                    disabled={revokingId === inv.id}
                    className="text-sm text-red-500 hover:underline disabled:opacity-50"
                  >
                    {revokingId === inv.id ? "Revoking…" : "Revoke"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
