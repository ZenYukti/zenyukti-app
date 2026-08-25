type StatusTone = "positive" | "warning" | "negative" | "neutral";

const STATUS_TONES: Record<string, StatusTone> = {
  active: "positive",
  accepted: "positive",
  invited: "warning",
  pending: "warning",
  suspended: "negative",
  disabled: "negative",
  revoked: "negative",
  expired: "neutral",
};

const PILL_CLASSES: Record<StatusTone, string> = {
  positive: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  warning: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  negative: "bg-red-500/10 text-red-600 dark:text-red-400",
  neutral: "bg-zinc-500/10 text-muted",
};

const DOT_CLASSES: Record<StatusTone, string> = {
  positive: "bg-emerald-500",
  warning: "bg-amber-500",
  negative: "bg-red-500",
  neutral: "bg-muted",
};

function toneOf(status: string): StatusTone {
  return STATUS_TONES[status.toLowerCase()] ?? "neutral";
}

export function StatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase();
  const style = PILL_CLASSES[toneOf(status)];
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${style}`}
    >
      {normalized}
    </span>
  );
}

/** Lighter-weight status indicator for editorial contexts (e.g. the dashboard hero) where a full pill reads too "admin table". */
export function StatusDot({ status }: { status: string }) {
  const normalized = status.toLowerCase();
  const dot = DOT_CLASSES[toneOf(status)];
  return (
    <span className="inline-flex items-center gap-1.5 text-sm text-muted">
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} aria-hidden />
      <span className="capitalize">{normalized}</span>
    </span>
  );
}
