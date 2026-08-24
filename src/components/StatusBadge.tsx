const STYLES: Record<string, string> = {
  active: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  invited: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  pending: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  accepted: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  suspended: "bg-red-500/10 text-red-600 dark:text-red-400",
  disabled: "bg-red-500/10 text-red-600 dark:text-red-400",
  revoked: "bg-red-500/10 text-red-600 dark:text-red-400",
  expired: "bg-zinc-500/10 text-muted",
};

export function StatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase();
  const style = STYLES[normalized] ?? "bg-zinc-500/10 text-muted";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${style}`}
    >
      {normalized}
    </span>
  );
}
