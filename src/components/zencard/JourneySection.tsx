import { SectionHeading } from "@/components/zencard/SectionHeading";
import { JOURNEY_ICONS, JourneyFallbackIcon } from "@/components/zencard/icons";
import type { ProfileJourneyEntry } from "@/lib/types";

function nodeIcon(icon?: string) {
  if (!icon) return <JourneyFallbackIcon />;
  return JOURNEY_ICONS[icon.toLowerCase()] ?? <JourneyFallbackIcon />;
}

export function JourneySection({
  entries,
}: {
  entries: ProfileJourneyEntry[];
}) {
  if (entries.length === 0) return null;

  return (
    <aside
      aria-labelledby="journey-heading"
      className="lg:w-80 lg:shrink-0 lg:border-l lg:border-border lg:pl-8"
    >
      <SectionHeading id="journey-heading">ZenYukti Journey</SectionHeading>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        A journey of learning, building and creating impact together.
      </p>

      {/* display_order (server-provided order) drives rendering directly —
          never re-sorted by entry_date on the frontend. */}
      <ol className="mt-6 flex flex-col">
        {entries.map((entry, i) => {
          const isLast = i === entries.length - 1;
          return (
            <li key={`${entry.title}-${i}`} className="relative flex gap-4 pb-8 last:pb-0">
              {!isLast && (
                <span
                  aria-hidden="true"
                  className="absolute left-[15px] top-8 bottom-0 w-px bg-border"
                />
              )}
              <span
                aria-hidden="true"
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                  isLast
                    ? "bg-accent text-accent-foreground"
                    : "bg-accent/10 text-accent"
                }`}
              >
                <span className="h-4 w-4">{nodeIcon(entry.icon)}</span>
              </span>
              <div className="min-w-0 pt-1">
                {entry.date && (
                  <p className="text-xs text-muted">{entry.date}</p>
                )}
                <p className="mt-0.5 text-sm font-medium">{entry.title}</p>
                {entry.description && (
                  <p className="mt-1 text-sm leading-relaxed text-muted">
                    {entry.description}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </aside>
  );
}
