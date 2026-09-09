"use client";

import { useEffect, useState } from "react";
import { SunIcon, MoonIcon } from "@/components/zencard/icons";

type Theme = "light" | "dark";

const STORAGE_KEY = "zenyukti-theme";

function apply(theme: Theme) {
  document.documentElement.setAttribute("data-theme", theme);
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // localStorage unavailable (private mode, etc.) — the choice just
    // won't persist across visits, which is a fine degradation.
  }
}

/**
 * Light/dark toggle for the public ZenCard page. Deliberately simple: no
 * SSR-injected script to prevent a first-paint flash — a brief flash on
 * an already-cached, mostly-static page is an acceptable trade-off for
 * not introducing a new theme-bootstrapping architecture. Defaults to
 * following the system preference (globals.css's existing
 * prefers-color-scheme block) until the visitor picks explicitly.
 */
export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "light" || stored === "dark") {
        // Reading a browser-only store (localStorage) can't happen during
        // render without a server/client hydration mismatch — this effect
        // running once on mount is the correct place for it.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setTheme(stored);
        document.documentElement.setAttribute("data-theme", stored);
      }
    } catch {
      // ignore
    }
  }, []);

  function choose(next: Theme) {
    setTheme(next);
    apply(next);
  }

  return (
    <div
      role="group"
      aria-label="Color theme"
      className="flex items-center gap-1 rounded-full border border-border bg-surface p-1"
    >
      <button
        type="button"
        onClick={() => choose("light")}
        aria-pressed={theme === "light"}
        aria-label="Light theme"
        className={`flex h-7 w-7 items-center justify-center rounded-full transition-colors ${
          theme !== "dark"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted hover:text-foreground"
        }`}
      >
        <span className="h-4 w-4">
          <SunIcon />
        </span>
      </button>
      <button
        type="button"
        onClick={() => choose("dark")}
        aria-pressed={theme === "dark"}
        aria-label="Dark theme"
        className={`flex h-7 w-7 items-center justify-center rounded-full transition-colors ${
          theme === "dark"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted hover:text-foreground"
        }`}
      >
        <span className="h-4 w-4">
          <MoonIcon />
        </span>
      </button>
    </div>
  );
}
