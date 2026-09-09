import { SectionHeading } from "@/components/zencard/SectionHeading";

export function InterestsSection({ interests }: { interests: string[] }) {
  if (interests.length === 0) return null;

  return (
    <section aria-labelledby="interests-heading">
      <SectionHeading id="interests-heading">Interests</SectionHeading>
      <ul className="mt-4 flex flex-wrap gap-2">
        {interests.map((interest) => (
          <li
            key={interest}
            className="rounded-full bg-surface px-3.5 py-1.5 text-sm"
          >
            {interest}
          </li>
        ))}
      </ul>
    </section>
  );
}
