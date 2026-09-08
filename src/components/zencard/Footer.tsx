import { Logo } from "@/components/Logo";

const LINKS = [
  { href: "https://zenyukti.in/team", label: "Team" },
  { href: "https://zenyukti.in/projects", label: "Projects" },
  { href: "https://zenyukti.in/community", label: "Community" },
  { href: "https://zenyukti.in/careers", label: "Careers" },
];

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-4 py-8 sm:flex-row sm:items-center sm:px-6">
        <div>
          <Logo />
          <p className="mt-1 text-xs text-muted">Learn. Build. Share.</p>
        </div>
        <nav aria-label="Footer" className="flex flex-wrap gap-x-5 gap-y-2">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-muted hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  );
}
