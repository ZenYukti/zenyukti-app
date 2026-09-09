import { SectionHeading } from "@/components/zencard/SectionHeading";
import { ExternalLinkIcon } from "@/components/zencard/icons";
import type { ProfileFeaturedWorkItem } from "@/lib/types";

function Thumbnail({ item }: { item: ProfileFeaturedWorkItem }) {
  if (item.image_url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={item.image_url}
        alt=""
        className="h-32 w-full rounded-md object-cover"
      />
    );
  }

  // No image — a typography-based fallback in the reference's spirit,
  // built from this item's own title, never a placeholder photo.
  return (
    <div
      className="flex h-32 w-full items-center justify-center rounded-md bg-foreground px-4 text-center"
      aria-hidden="true"
    >
      <span className="font-[family-name:var(--font-serif)] text-lg font-medium leading-snug text-background">
        {item.title}
      </span>
    </div>
  );
}

function Card({ item }: { item: ProfileFeaturedWorkItem }) {
  const content = (
    <>
      <Thumbnail item={item} />
      <div className="mt-4 flex items-start justify-between gap-2">
        <h3 className="font-medium">{item.title}</h3>
        {item.url && (
          <span className="mt-0.5 h-4 w-4 shrink-0 text-muted" aria-hidden="true">
            <ExternalLinkIcon />
          </span>
        )}
      </div>
      {item.description && (
        <p className="mt-1.5 text-sm leading-relaxed text-muted">
          {item.description}
        </p>
      )}
      {item.tags.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {item.tags.map((tag) => (
            <li
              key={tag}
              className="rounded-full border border-border px-2.5 py-0.5 text-xs text-muted"
            >
              {tag}
            </li>
          ))}
        </ul>
      )}
    </>
  );

  const className =
    "block rounded-lg border border-border p-4 transition-colors hover:border-accent/40";

  if (item.url) {
    return (
      <a href={item.url} target="_blank" rel="noreferrer" className={className}>
        {content}
      </a>
    );
  }

  return <div className={className}>{content}</div>;
}

export function FeaturedWorkSection({
  items,
}: {
  items: ProfileFeaturedWorkItem[];
}) {
  if (items.length === 0) return null;

  return (
    <section aria-labelledby="featured-work-heading">
      <SectionHeading id="featured-work-heading">Featured Work</SectionHeading>
      {/* Server-provided order (display_order) is rendered as-is — never
          re-sorted client-side, per the ownership rule on this data. */}
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {items.map((item, i) => (
          <Card key={`${item.title}-${i}`} item={item} />
        ))}
      </div>
    </section>
  );
}
