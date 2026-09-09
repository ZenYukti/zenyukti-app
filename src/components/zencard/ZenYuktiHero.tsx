// The ZenYukti brand banner — static and identical for every member; not
// derived from profile data. No stock photo dependency exists in this
// repo (see task audit), so the reference's mountain motif is reproduced
// as a flat, monochrome-blue-gray inline SVG silhouette over a soft sky
// gradient, occupying the same right-hand portion of the hero the
// reference's photo does, rather than faking a real photo or pulling in
// an external image.
function MountainPanel() {
  return (
    <div className="relative h-36 w-full overflow-hidden sm:h-44 lg:h-auto lg:w-[42%]">
      <div
        className="absolute inset-0 bg-gradient-to-b from-slate-100 to-slate-300"
        aria-hidden="true"
      />
      <svg
        viewBox="0 0 500 300"
        preserveAspectRatio="xMidYMax slice"
        className="absolute inset-0 h-full w-full"
        aria-hidden="true"
      >
        <polygon
          points="0,300 60,150 130,210 210,90 280,220 360,60 440,190 500,140 500,300"
          className="fill-slate-400/70"
        />
        <polygon
          points="0,300 80,220 160,255 260,140 330,240 420,175 500,235 500,300"
          className="fill-slate-600/80"
        />
      </svg>

      <div className="absolute right-5 top-5 text-right font-mono text-[11px] uppercase leading-relaxed tracking-[0.2em] text-white/90 sm:right-8 sm:top-8">
        <p>Building</p>
        <p>People</p>
        <p>Building</p>
        <p>Possibilities</p>
        <div className="ml-auto mt-2 h-px w-8 bg-white/60" aria-hidden="true" />
      </div>
    </div>
  );
}

// Member-centric: ZenYukti branding stays (eyebrow label, mountain panel,
// the "Learn. Build. Share." line), but the headline itself is the member
// being viewed — this is their ZenCard, not another ZenYukti homepage.
export function ZenYuktiHero({
  displayName,
  title,
}: {
  displayName: string;
  title?: string;
}) {
  return (
    <section className="flex flex-col overflow-hidden rounded-lg border border-border bg-surface lg:flex-row lg:items-stretch">
      <div className="flex flex-col justify-center px-6 py-8 sm:px-8 sm:py-10 lg:w-[58%] lg:py-10">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted">
          ZenYukti Team Member
        </p>
        <h2 className="mt-3 font-[family-name:var(--font-serif)] text-4xl leading-[1.05] sm:text-5xl">
          {displayName}
        </h2>
        {title && <p className="mt-2 text-base text-foreground/80 sm:text-lg">{title}</p>}
        <div className="mt-4 h-px w-12 bg-accent" aria-hidden="true" />
        <p className="mt-4 font-mono text-xs uppercase tracking-[0.15em] text-muted">
          Learn. Build. Share.
        </p>
      </div>

      <MountainPanel />
    </section>
  );
}
