"use client";

import { useState } from "react";

/**
 * Sidebar "Share Profile" action — navigator.share() where supported
 * (mobile browsers, mainly), falling back to copying the URL to the
 * clipboard with transient "Link copied" feedback. Same fallback pattern
 * as the existing <CopyButton>, just with richer share data.
 */
export function ShareProfileButton({
  url,
  title,
  text,
}: {
  url: string;
  title: string;
  text: string;
}) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
      } catch {
        // AbortError when the user dismisses the native share sheet —
        // nothing to do.
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable/denied — silently no-op, same as
      // CopyButton's own fallback behavior.
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className="w-full rounded-md border border-border px-4 py-2.5 text-sm font-medium transition-colors hover:bg-surface"
    >
      {copied ? "Link copied" : "Share Profile"}
    </button>
  );
}
