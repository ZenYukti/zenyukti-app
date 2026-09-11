export function ZenYuktiHero({
  bannerUrl,
}: {
  bannerUrl?: string;
}) {
  return (
    <section className="flex flex-col overflow-hidden rounded-lg border border-border bg-surface lg:flex-row lg:items-stretch">
      <div className="flex flex-col justify-center px-6 py-8 sm:px-8 sm:py-10 lg:w-[58%] lg:py-10">
        <h2 className="mt-3 font-[family-name:var(--font-serif)] text-4xl leading-[1.05] sm:text-5xl">
          WE DON&apos;T BUILD ALONE.
        </h2>
        <div className="mt-4 h-px w-12 bg-accent" aria-hidden="true" />
        <p className="mt-4 max-w-md text-base leading-relaxed text-foreground/80 sm:text-lg">
          We learn from the people around us, and every experience becomes part of the journey.
        </p>
        <p className="mt-5 font-mono text-xs uppercase tracking-[0.15em] text-muted">
          Here is my ZenLife!
        </p>
      </div>

      {bannerUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={bannerUrl}
          alt=""
          className="aspect-[3/2] w-full object-cover lg:w-[42%]"
        />
      ) : (
        <div
          className="flex aspect-[3/2] w-full items-end bg-[linear-gradient(135deg,#e8e4dc,#b8c3c0)] p-6 lg:w-[42%]"
          aria-label="ZenYukti banner placeholder"
        >
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/90">
            Team ZenYukti
          </span>
        </div>
      )}
    </section>
  );
}
