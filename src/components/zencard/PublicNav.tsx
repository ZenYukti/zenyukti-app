import { ThemeToggle } from "@/components/zencard/ThemeToggle";
import { ExternalLinkIcon } from "@/components/zencard/icons";

// Top brand bar for the public /u/[username] ZenCard page — deliberately
// not the authenticated app shell's <Nav> (Dashboard/Profile/Team/
// Members/Invitations), which requires a signed-in session. Kept minimal
// per the reference: wordmark + tagline, "Visit ZenYukti", theme toggle.
export function PublicNav() {
  return (
    <header className="border-b border-border">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6">
        <a href="https://zenyukti.in" className="flex flex-col leading-tight">
          <span className="font-mono text-lg font-semibold tracking-tight">
            Zen<span className="text-accent">Yukti</span>
          </span>
          <span className="text-xs text-muted">Learn. Build. Share.</span>
        </a>
        <div className="flex items-center gap-4">
          <a
            href="https://zenyukti.in"
            className="hidden items-center gap-1.5 text-sm text-foreground transition-colors hover:text-accent sm:inline-flex"
          >
            Visit ZenYukti
            <span className="h-3.5 w-3.5">
              <ExternalLinkIcon />
            </span>
          </a>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
