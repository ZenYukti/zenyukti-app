"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { StatusBadge } from "@/components/StatusBadge";
import { STANDING_LABELS, standingLabel } from "@/lib/standing";
import type { CoreMember } from "@/lib/types";

// GET /v1/users has no query params and no pagination (fine at ~20 users
// per the backend's own comment) — search/filter happen client-side over
// the already-fetched full list, not as new backend capability.
const SELECT_CLASS =
  "rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent";

export function MembersDirectory({ members }: { members: CoreMember[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [standing, setStanding] = useState("all");

  const availableStatuses = useMemo(
    () => [...new Set(members.map((m) => m.status))].sort(),
    [members],
  );
  const availableStandings = useMemo(
    () => [...new Set(members.map((m) => m.standing_role ?? ""))].sort(),
    [members],
  );

  const filtered = members.filter((m) => {
    if (query) {
      const q = query.toLowerCase();
      const matchesEmail = m.email.toLowerCase().includes(q);
      const matchesName = m.profile?.display_name.toLowerCase().includes(q);
      if (!matchesEmail && !matchesName) return false;
    }
    if (status !== "all" && m.status !== status) return false;
    if (standing !== "all" && (m.standing_role ?? "") !== standing)
      return false;
    return true;
  });

  const filtersActive = query !== "" || status !== "all" || standing !== "all";

  function clearFilters() {
    setQuery("");
    setStatus("all");
    setStanding("all");
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or email…"
          aria-label="Search members by name or email"
          className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
        />
        {availableStatuses.length > 1 && (
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            aria-label="Filter by status"
            className={SELECT_CLASS}
          >
            <option value="all">All statuses</option>
            {availableStatuses.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0) + s.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
        )}
        {availableStandings.length > 1 && (
          <select
            value={standing}
            onChange={(e) => setStanding(e.target.value)}
            aria-label="Filter by standing"
            className={SELECT_CLASS}
          >
            <option value="all">All standings</option>
            {availableStandings.map((s) => (
              <option key={s || "unassigned"} value={s}>
                {s ? (STANDING_LABELS[s] ?? s) : "Unassigned"}
              </option>
            ))}
          </select>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-md border border-border p-6 text-center text-sm text-muted">
          <p>No members match {filtersActive ? "these filters" : "your search"}.</p>
          {filtersActive && (
            <button
              onClick={clearFilters}
              className="mt-2 text-accent hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="divide-y divide-border border-t border-border">
          {filtered.map((member) => {
            const name = member.profile?.display_name;
            return (
              <Link
                key={member.id}
                href={`/members/${member.id}`}
                className="flex items-center justify-between gap-4 py-3 hover:bg-surface"
              >
                <div className="flex min-w-0 items-center gap-3">
                  {member.profile?.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={member.profile.avatar_url}
                      alt={name || member.email}
                      className="h-8 w-8 shrink-0 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface text-xs font-medium text-muted">
                      {(name || member.email).slice(0, 1).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-sm">{name || member.email}</p>
                    {name && (
                      <p className="truncate text-xs text-muted">
                        {member.email}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {member.standing_role && (
                    <span className="text-xs text-muted">
                      {standingLabel(member.standing_role)}
                    </span>
                  )}
                  <StatusBadge status={member.status} />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
