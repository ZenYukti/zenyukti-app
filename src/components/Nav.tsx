"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignOutButton } from "@/components/SignOutButton";

const LINKS = [
  { href: "/", label: "Dashboard" },
  { href: "/profile", label: "Profile" },
  { href: "/team", label: "Team" },
  { href: "/members", label: "Members" },
  { href: "/invitations", label: "Invitations" },
];

export function Nav({
  displayName,
  showInvitations,
  showMembers,
}: {
  displayName: string;
  showInvitations: boolean;
  showMembers: boolean;
}) {
  const pathname = usePathname();

  const links = LINKS.filter((link) => {
    if (link.href === "/invitations") return showInvitations;
    if (link.href === "/team" || link.href === "/members") return showMembers;
    return true;
  });

  return (
    <header className="border-b border-border">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/assets/zenyukti-logo.png"
            alt=""
            width={32}
            height={32}
            className="h-8 w-8 shrink-0"
            priority
          />
          <span className="flex flex-col leading-tight">
            <span className="font-mono text-lg font-semibold tracking-tight">
              Zen<span className="text-accent">Yukti</span>
            </span>
            <span className="hidden text-xs text-muted sm:block">
              Learn. Build. Share.
            </span>
          </span>
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {links.map((link) => {
            const active =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                  active
                    ? "bg-surface text-foreground"
                    : "text-muted hover:text-foreground"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-4">
          <span className="hidden text-sm text-muted sm:inline">
            {displayName}
          </span>
          <SignOutButton />
        </div>
      </div>
      <nav className="flex items-center gap-1 overflow-x-auto border-t border-border px-4 py-2 md:hidden">
        {links.map((link) => {
          const active =
            link.href === "/"
              ? pathname === "/"
              : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`shrink-0 rounded-md px-3 py-1.5 text-sm transition-colors ${
                active
                  ? "bg-surface text-foreground"
                  : "text-muted hover:text-foreground"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
