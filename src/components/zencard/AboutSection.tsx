export function AboutSection({ bio }: { bio?: string }) {
  if (!bio) return null;

  return (
    <section aria-labelledby="about-heading">
      <h2
        id="about-heading"
        className="font-[family-name:var(--font-serif)] text-2xl"
      >
        About Me
      </h2>
      <div className="mt-3 h-px w-10 bg-accent" aria-hidden="true" />
      <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-foreground/90 whitespace-pre-line">
        {bio}
      </p>
    </section>
  );
}
