export function SkillsSection({ skills }: { skills: string[] }) {
  if (skills.length === 0) return null;

  return (
    <section aria-labelledby="skills-heading">
      <h2
        id="skills-heading"
        className="font-[family-name:var(--font-serif)] text-2xl"
      >
        Skills
      </h2>
      <div className="mt-3 h-px w-10 bg-accent" aria-hidden="true" />
      <ul className="mt-5 flex flex-wrap gap-2.5">
        {skills.map((skill) => (
          <li
            key={skill}
            className="rounded-full border border-border px-3.5 py-1.5 text-sm"
          >
            {skill}
          </li>
        ))}
      </ul>
    </section>
  );
}
