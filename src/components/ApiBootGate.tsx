"use client";

import { useEffect, useId, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/lib/api";

const RETRY_SECONDS = 8;
const HEALTH_CHECK_TIMEOUT_MS = 6000;
/** Consecutive failed checks after which messaging shifts to "taking
 * longer than expected" — roughly RETRY_SECONDS * this many seconds in. */
const SLOW_ATTEMPT_THRESHOLD = 4;
const PUBLIC_HEALTH_URL = `${API_BASE_URL}/healthz`;

type Phase = "checking" | "waiting" | "ready";

function wait(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

async function checkHealth(): Promise<boolean> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), HEALTH_CHECK_TIMEOUT_MS);
  try {
    const res = await fetch("/api/health-check", {
      cache: "no-store",
      signal: controller.signal,
    });
    if (!res.ok) return false;
    const data: unknown = await res.json().catch(() => null);
    return (
      typeof data === "object" &&
      data !== null &&
      (data as { ok?: unknown }).ok === true
    );
  } catch {
    return false;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Full-screen "system boot" overlay shown while the Core API is
 * unreachable during initial page load (see ApiUnavailableError in
 * src/lib/api.ts). Polls /api/health-check on an 8s cadence and, once
 * healthy, refreshes the server tree so the app recovers without a manual
 * page reload. Renders nothing when `apiUnavailable` is false.
 */
export function ApiBootGate({ apiUnavailable }: { apiUnavailable: boolean }) {
  const router = useRouter();
  // AppLayout and a page can each independently detect an unreachable API
  // and mount this gate at the same time — unique ids keep aria-labelledby/
  // aria-describedby scoped correctly if that ever happens simultaneously.
  const headingId = useId();
  const titleId = `${headingId}-title`;
  const descId = `${headingId}-desc`;
  const [phase, setPhase] = useState<Phase>("checking");
  const [secondsLeft, setSecondsLeft] = useState(RETRY_SECONDS);
  const [attempts, setAttempts] = useState(0);
  const [retryNonce, setRetryNonce] = useState(0);
  const [, startTransition] = useTransition();

  const dialogRef = useRef<HTMLDivElement>(null);
  const retryButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!apiUnavailable) return;

    let cancelled = false;
    let countdownTimer: ReturnType<typeof setInterval> | undefined;

    async function runLoop() {
      setAttempts(0);
      while (!cancelled) {
        setPhase("checking");
        const healthy = await checkHealth();
        if (cancelled) return;

        if (healthy) {
          setPhase("ready");
          await wait(700);
          if (cancelled) return;
          startTransition(() => router.refresh());
          return;
        }

        setAttempts((n) => n + 1);
        setPhase("waiting");
        setSecondsLeft(RETRY_SECONDS);

        await new Promise<void>((resolve) => {
          let remaining = RETRY_SECONDS;
          countdownTimer = setInterval(() => {
            if (cancelled) {
              clearInterval(countdownTimer);
              resolve();
              return;
            }
            remaining -= 1;
            if (remaining <= 0) {
              clearInterval(countdownTimer);
              resolve();
            } else {
              setSecondsLeft(remaining);
            }
          }, 1000);
        });
      }
    }

    runLoop();

    return () => {
      cancelled = true;
      if (countdownTimer) clearInterval(countdownTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiUnavailable, retryNonce]);

  useEffect(() => {
    if (apiUnavailable) {
      retryButtonRef.current?.focus();
    }
  }, [apiUnavailable]);

  if (!apiUnavailable) return null;

  const isSlow = attempts >= SLOW_ATTEMPT_THRESHOLD;

  function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key !== "Tab") return;
    const focusables = dialogRef.current?.querySelectorAll<HTMLElement>(
      "button, a[href]",
    );
    if (!focusables || focusables.length === 0) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  const title =
    phase === "ready"
      ? "ZenYukti OS is ready"
      : isSlow
        ? "Still waking ZenYukti OS…"
        : "Waking ZenYukti OS…";

  const description =
    phase === "ready"
      ? "Connection established — loading your dashboard."
      : "Getting things ready. This may take a moment.";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        onKeyDown={handleKeyDown}
        className="w-full max-w-sm rounded-lg border border-border bg-background p-6 shadow-2xl motion-safe:animate-[boot-gate-in_.25s_ease-out]"
      >
        <div className="flex flex-col items-center gap-1 text-center">
          <div
            className="relative mb-2 flex h-10 w-10 items-center justify-center"
            aria-hidden="true"
          >
            <span className="absolute inset-1 rounded-full border border-accent/30 motion-safe:animate-[boot-orbit_2.4s_linear_infinite] motion-reduce:animate-none" />
            <span className="absolute inset-2 rounded-full border border-accent/15 motion-safe:animate-[boot-pulse_2s_ease-in-out_infinite] motion-reduce:animate-none" />
            <span className="relative h-2.5 w-2.5 rounded-full bg-accent motion-safe:animate-[boot-pulse_1.6s_ease-in-out_infinite] motion-reduce:animate-none" />
          </div>
          <p className="font-mono text-sm font-semibold tracking-tight">
            Zen<span className="text-accent">Yukti</span>
          </p>
          <h2
            id={titleId}
            className="mt-2 text-lg font-semibold tracking-tight"
          >
            {title}
          </h2>
          <p id={descId} className="mt-1 text-sm text-muted">
            {description}
          </p>
        </div>

        <div className="mt-5 flex flex-col items-center gap-1.5">
          <div
            className="flex items-center gap-2 text-sm text-foreground"
            aria-live="polite"
            aria-atomic="true"
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                phase === "ready" ? "bg-emerald-500" : "bg-accent"
              } motion-safe:animate-pulse motion-reduce:animate-none`}
              aria-hidden="true"
            />
            <span>
              {phase === "ready"
                ? "ZenYukti OS is ready"
                : phase === "waiting"
                  ? `Retrying in ${secondsLeft}s…`
                  : "Establishing connection…"}
            </span>
          </div>
        </div>

        <div className="mt-6 flex flex-col items-center gap-2">
          <button
            ref={retryButtonRef}
            type="button"
            onClick={() => setRetryNonce((n) => n + 1)}
            className="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-surface"
          >
            Retry now
          </button>
          <a
            href={PUBLIC_HEALTH_URL}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-muted underline-offset-2 hover:text-foreground hover:underline"
          >
            Check API health status
          </a>
        </div>
      </div>
    </div>
  );
}
