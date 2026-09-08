// The ZenYukti brand banner — static and identical for every member; not
// derived from profile data. No stock photo/gradient/glow: a restrained
// bordered panel where typography carries the "premium" feeling instead.
export function ZenYuktiHero() {
  return (
    <section className="rounded-lg border border-border bg-surface px-6 py-10 sm:px-10 sm:py-14">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted">
        ZenYukti
      </p>
      <h2 className="mt-3 font-[family-name:var(--font-serif)] text-4xl leading-tight sm:text-5xl">
        Learn. Build. Share.
      </h2>
      <div className="mt-5 h-px w-12 bg-accent" aria-hidden="true" />
      <p className="mt-5 font-mono text-xs uppercase tracking-[0.15em] text-muted">
        People · Ideas · Communities · A Better Tomorrow
      </p>
    </section>
  );
}
