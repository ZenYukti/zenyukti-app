"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { acceptInvitation } from "@/lib/invitation-actions";
import { closedStateFor } from "@/lib/invitation-errors";
import { Logo } from "@/components/Logo";

export function AcceptInvitationForm({
  token,
  email,
}: {
  token: string;
  email: string;
}) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [closed, setClosed] = useState<{ title: string; body: string } | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [acceptedEmail, setAcceptedEmail] = useState<string | null>(null);

  if (acceptedEmail) {
    return (
      <Message
        title="Welcome to ZenYukti"
        body={`Your account for ${acceptedEmail} has been created. You can now sign in.`}
        action={
          <Link
            href="/login"
            className="mt-4 inline-block rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:opacity-90"
          >
            Go to sign in
          </Link>
        }
      />
    );
  }

  if (closed) {
    return (
      <Message
        title={closed.title}
        body={closed.body}
        action={
          <Link
            href="/login"
            className="mt-4 inline-block text-sm text-accent hover:underline"
          >
            Go to sign in
          </Link>
        }
      />
    );
  }

  const lengthOk = password.length >= 8;
  const matchOk = password.length > 0 && password === confirmPassword;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);
    setError(null);

    if (!lengthOk) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (!matchOk) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const result = await acceptInvitation(token, password);
      if (!result.ok) {
        const state = closedStateFor(result.status, result.error);
        if (state) {
          setClosed(state);
          return;
        }
        setError(result.error);
        return;
      }
      setAcceptedEmail(result.email);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-2 text-center">
          <Logo />
          <p className="text-sm text-muted">
            You&apos;re joining ZenYukti. Create a password to finish
            setting up your account.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              disabled
              readOnly
              aria-readonly="true"
              className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-muted"
            />
            <p className="text-xs text-muted">
              This invitation is tied to this email address.
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => setTouched(true)}
              aria-describedby="password-hint"
              className="rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
              placeholder="At least 8 characters"
            />
            <p
              id="password-hint"
              className={`text-xs ${touched && !lengthOk ? "text-red-500" : "text-muted"}`}
            >
              At least 8 characters
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="confirmPassword" className="text-sm font-medium">
              Confirm password
            </label>
            <input
              id="confirmPassword"
              type="password"
              required
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onBlur={() => setTouched(true)}
              className="rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
              placeholder="Re-enter password"
            />
            {touched && confirmPassword.length > 0 && !matchOk && (
              <p className="text-xs text-red-500">Passwords do not match.</p>
            )}
          </div>

          {error && (
            <p className="rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-500">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 rounded-md bg-accent px-3 py-2 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>
      </div>
    </div>
  );
}

export function Message({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex justify-center">
          <Logo />
        </div>
        <h1 className="text-lg font-semibold">{title}</h1>
        <p className="mt-2 text-sm text-muted">{body}</p>
        {action}
      </div>
    </div>
  );
}
