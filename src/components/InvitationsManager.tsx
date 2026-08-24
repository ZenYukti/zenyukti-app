"use client";

import { useState } from "react";
import { apiFetch, ApiError } from "@/lib/api";
import { createClient } from "@/lib/supabase/client";
import { StatusBadge } from "@/components/StatusBadge";
import type { CoreInvitation } from "@/lib/types";

async function getToken() {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.access_token ?? null;
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
  const [role, setRole] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [issuing, setIssuing] = useState(false);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  async function handleIssue(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIssuing(true);
    try {
      const token = await getToken();
      const invitation = await apiFetch<CoreInvitation>(
        "/v1/invitations",
        token,
        {
          method: "POST",
          body: JSON.stringify({ email, role: role || undefined }),
        },
      );
      setInvitations((prev) => [invitation, ...prev]);
      setEmail("");
      setRole("");
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.detail || err.message
          : "Failed to issue invitation.",
      );
    } finally {
      setIssuing(false);
    }
  }

  async function handleRevoke(id: string) {
    setError(null);
    setRevokingId(id);
    try {
      const token = await getToken();
      await apiFetch(`/v1/invitations/${id}/revoke`, token, {
        method: "POST",
      });
      setInvitations((prev) =>
        prev.map((inv) => (inv.id === id ? { ...inv, status: "revoked" } : inv)),
      );
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.detail || err.message
          : "Failed to revoke invitation.",
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
          <div className="flex flex-col gap-1.5 sm:w-48">
            <label htmlFor="invite-role" className="text-sm font-medium">
              Role (optional)
            </label>
            <input
              id="invite-role"
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. zenmate"
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
                {inv.role && <p className="text-xs text-muted">{inv.role}</p>}
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={inv.status} />
                {canManage && inv.status === "pending" && (
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
