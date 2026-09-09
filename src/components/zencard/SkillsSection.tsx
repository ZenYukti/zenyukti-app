import { SectionHeading } from "@/components/zencard/SectionHeading";

export function SkillsSection({ skills }: { skills: string[] }) {
  if (skills.length === 0) return null;

  return (
    <section aria-labelledby="skills-heading">
      <SectionHeading id="skills-heading">Skills</SectionHeading>
      <ul className="mt-4 flex flex-wrap gap-2">
        {skills.map((skill) => (
          <li
            key={skill}
            className="rounded-full bg-surface px-3.5 py-1.5 text-sm"
          >
            {skill}
          </li>
        ))}
      </ul>
    </section>
  );
}
