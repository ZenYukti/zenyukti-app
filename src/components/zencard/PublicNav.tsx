import { Logo } from "@/components/Logo";

// Public-site navigation for the anonymous /u/[username] ZenCard page —
// deliberately not the authenticated app shell's <Nav> (Dashboard/Profile/
// Team/Members/Invitations), which requires a signed-in session and links
// into app.zenyukti.in's internal tools. These links point at the public
// zenyukti.in marketing site, matching the reference design's nav.
const LINKS = [
  { href: "https://zenyukti.in/team", label: "Team" },
  { href: "https://zenyukti.in/projects", label: "Projects" },
  { href: "https://zenyukti.in/community", label: "Community" },
  { href: "https://zenyukti.in/careers", label: "Careers" },
];

export function PublicNav() {
  return (
    <header className="border-b border-border">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <a href="https://zenyukti.in" className="shrink-0">
          <Logo />
        </a>
        <nav className="hidden items-center gap-1 md:flex">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-1.5 text-sm text-muted transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>
        <a
          href="https://zenyukti.in"
          className="shrink-0 rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90"
        >
          Join Our Journey <span aria-hidden="true">→</span>
        </a>
      </div>
    </header>
  );
}
