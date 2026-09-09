"use client";

import { useState } from "react";
import { DownloadIcon } from "@/components/zencard/icons";

/**
 * IMPLEMENTATION BOUNDARY: no downloadable-ZenCard artifact (image/PDF
 * generation) exists anywhere in this codebase yet — see the audit in
 * this task. This button is intentionally kept as a real, honest
 * interactive element (not a dead link, not a silent no-op) that
 * communicates the feature isn't live rather than pretending a download
 * happened. Replace the onClick body with the real export once that
 * backend/artifact exists — nothing else about this component should need
 * to change.
 */
export function DownloadZenCardButton() {
  const [showNotice, setShowNotice] = useState(false);

  return (
    <div className="flex flex-col gap-1.5">
      <button
        type="button"
        onClick={() => setShowNotice(true)}
        aria-describedby={showNotice ? "download-zencard-notice" : undefined}
        className="flex w-full items-center justify-center gap-2 rounded-md bg-foreground px-4 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90"
      >
        <span className="h-4 w-4">
          <DownloadIcon />
        </span>
        Download ZenCard
      </button>
      {showNotice && (
        <p id="download-zencard-notice" className="text-center text-xs text-muted">
          Downloadable ZenCards are coming soon.
        </p>
      )}
    </div>
  );
}
