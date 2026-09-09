import type { ReactNode } from "react";

// Shared "heading + short trailing rule" treatment used by every ZenCard
// content section (About Me, Skills, Interests, Featured Work, ZenYukti
// Journey) — one place for the pattern instead of five near-identical
// copies.
export function SectionHeading({
  id,
  children,
}: {
  id: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-center gap-4">
      <h2
        id={id}
        className="font-[family-name:var(--font-serif)] text-2xl"
      >
        {children}
      </h2>
      <span className="h-px flex-1 max-w-12 bg-border" aria-hidden="true" />
    </div>
  );
}
