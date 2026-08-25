// zenyukti-os's seeded RBAC standing roles (see 00020_seed_core_rbac.sql).
// GET /v1/users and /v1/users/:id only return the slug for other members,
// never a display name, so this map exists purely to label it consistently.
export const STANDING_LABELS: Record<string, string> = {
  founder: "Founder",
  zencrew: "ZenCrew",
  zenmate: "ZenMate",
};

export const STANDING_ORDER = ["founder", "zencrew", "zenmate"];

export function standingLabel(slug: string | null | undefined) {
  if (!slug) return "Unassigned";
  return STANDING_LABELS[slug] ?? slug;
}

export function standingSortIndex(slug: string) {
  const i = STANDING_ORDER.indexOf(slug);
  return i === -1 ? STANDING_ORDER.length : i;
}

/** Counts members per standing slug, ordered founder → zencrew → zenmate → unassigned. */
export function standingBreakdown(
  members: { standing_role?: string | null }[],
) {
  const counts = new Map<string, number>();
  for (const m of members) {
    const slug = m.standing_role ?? "";
    counts.set(slug, (counts.get(slug) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort(([a], [b]) => standingSortIndex(a) - standingSortIndex(b))
    .map(([slug, count]) => ({ slug, label: standingLabel(slug), count }));
}
