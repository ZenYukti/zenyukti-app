// Organizational CTA — not member-specific, identical on every profile.
export function ZenYuktiCTA() {
  return (
    <section className="flex flex-col items-start gap-4 rounded-lg border border-border bg-surface px-6 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-8">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.15em] text-muted">
          Be a part of something meaningful
        </p>
        <p className="mt-2 font-[family-name:var(--font-serif)] text-xl sm:text-2xl">
          Let&apos;s build a better tomorrow, together.
        </p>
      </div>
      <a
        href="https://zenyukti.in"
        className="shrink-0 rounded-md bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90"
      >
        Explore ZenYukti <span aria-hidden="true">→</span>
      </a>
    </section>
  );
}
