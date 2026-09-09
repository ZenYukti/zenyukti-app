import { SOCIAL_ICONS } from "@/components/zencard/icons";

// ZenYukti's own org-level social presence — distinct from a member's
// personal socials rendered in the sidebar. URLs match the canonical
// LINKS established in the zenyukti (marketing site) repo's
// src/data/site.js, not guessed.
const ORG_SOCIALS: { key: keyof typeof SOCIAL_ICONS; label: string; href: string }[] = [
  { key: "github", label: "ZenYukti on GitHub", href: "https://github.com/ZenYukti" },
  { key: "linkedin", label: "ZenYukti on LinkedIn", href: "https://linkedin.com/company/zenyukti" },
  { key: "x", label: "ZenYukti on X", href: "https://x.com/zenyukti" },
  { key: "instagram", label: "ZenYukti on Instagram", href: "https://instagram.com/zenyukti" },
];

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-5 px-4 py-6 text-center sm:flex-row sm:justify-between sm:text-left sm:px-6">
        <div>
          <span className="font-mono text-base font-semibold tracking-tight">
            Zen<span className="text-accent">Yukti</span>
          </span>
          <p className="mt-0.5 text-xs text-muted">Learn. Build. Share.</p>
        </div>

        <p className="text-sm text-muted">
          A community of builders, creators and doers.
        </p>

        <div className="flex items-center gap-4">
          <nav aria-label="ZenYukti on social media" className="flex items-center gap-3">
            {ORG_SOCIALS.map(({ key, label, href }) => (
              <a
                key={key}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={label}
                className="h-4 w-4 text-muted transition-colors hover:text-foreground"
              >
                {SOCIAL_ICONS[key]}
              </a>
            ))}
          </nav>
          <span className="text-xs text-muted">
            Built with purpose <span aria-hidden="true">♥</span>
          </span>
        </div>
      </div>
    </footer>
  );
}
