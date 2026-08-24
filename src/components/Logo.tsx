export function Logo({ withTagline = false }: { withTagline?: boolean }) {
  return (
    <span className="flex items-baseline gap-2">
      <span className="font-mono text-lg font-semibold tracking-tight">
        Zen<span className="text-accent">Yukti</span>
      </span>
      {withTagline && (
        <span className="hidden text-xs text-muted sm:inline">
          Learn. Build. Share.
        </span>
      )}
    </span>
  );
}
