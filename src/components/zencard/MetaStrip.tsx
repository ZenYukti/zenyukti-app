import { CalendarIcon, PinIcon, PulseIcon, ClockIcon } from "@/components/zencard/icons";
import type { ReactNode } from "react";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// Manual split rather than `new Date(...)`: parsing "YYYY-MM-DD" through
// Date and formatting with the visitor's local timezone can roll the
// displayed month back a day near midnight UTC — this avoids that
// entirely for a value that's only ever meant to convey month + year.
function formatMemberSince(iso: string): string | null {
  const match = /^(\d{4})-(\d{2})-\d{2}$/.exec(iso);
  if (!match) return null;
  const [, year, month] = match;
  const name = MONTHS[Number(month) - 1];
  return name ? `${name} ${year}` : null;
}

function Item({
  icon,
  label,
  children,
}: {
  icon: ReactNode;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-center gap-3">
      <span
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface text-muted"
        aria-hidden="true"
      >
        <span className="h-4 w-4">{icon}</span>
      </span>
      <div className="min-w-0">
        <p className="font-mono text-[10px] uppercase tracking-wide text-muted">
          {label}
        </p>
        <p className="truncate text-sm font-medium">{children}</p>
      </div>
    </div>
  );
}

export function MetaStrip({
  memberSince,
  location,
  availability,
  focusAreas,
}: {
  memberSince?: string;
  location?: string;
  availability?: string;
  focusAreas: string[];
}) {
  const since = memberSince ? formatMemberSince(memberSince) : null;
  const hasFocusAreas = focusAreas.length > 0;

  if (!since && !location && !availability && !hasFocusAreas) return null;

  return (
    <div className="flex flex-wrap items-center gap-x-8 gap-y-4 rounded-lg border border-border bg-background px-6 py-4">
      {since && (
        <Item icon={<CalendarIcon />} label="Team Member Since">
          {since}
        </Item>
      )}
      {location && (
        <Item icon={<PinIcon />} label="Location">
          {location}
        </Item>
      )}
      {availability && (
        <Item icon={<PulseIcon />} label="Availability">
          <span className="inline-flex items-center gap-1.5">
            {/* availability is free text with no enum backing it — this is
                a heuristic on wording, not a structured "open" flag, so it
                only lights up for phrasing that actually reads as open. */}
            {/open/i.test(availability) && (
              <span
                className="h-1.5 w-1.5 rounded-full bg-emerald-500"
                aria-hidden="true"
              />
            )}
            {availability}
          </span>
        </Item>
      )}
      {hasFocusAreas && (
        <Item icon={<ClockIcon />} label="Focus Areas">
          {focusAreas.join(", ")}
        </Item>
      )}
    </div>
  );
}
