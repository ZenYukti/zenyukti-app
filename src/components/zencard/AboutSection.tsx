import { SectionHeading } from "@/components/zencard/SectionHeading";

export function AboutSection({ bio }: { bio?: string }) {
  if (!bio) return null;

  return (
    <section aria-labelledby="about-heading">
      <SectionHeading id="about-heading">About Me</SectionHeading>
      <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-foreground/90 whitespace-pre-line">
        {bio}
      </p>
    </section>
  );
}
