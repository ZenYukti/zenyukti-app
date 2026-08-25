import Link from "next/link";
import { lookupInvitation } from "@/lib/invitation-actions";
import { closedStateFor } from "@/lib/invitation-errors";
import { AcceptInvitationForm, Message } from "@/components/AcceptInvitationForm";

export default async function AcceptInvitationPage({
  searchParams,
}: PageProps<"/invitations/accept">) {
  const { token: rawToken } = await searchParams;
  const token = typeof rawToken === "string" ? rawToken : undefined;

  if (!token) {
    return (
      <Message
        title="Invalid invitation link"
        body="This invitation link is missing its token. Please use the link from your invitation email."
      />
    );
  }

  // Resolved server-side: the token→email lookup call would otherwise run
  // from the browser straight to api.zenyukti.in, which zenyukti-os's
  // missing CORS support silently blocks (same root cause traced for the
  // actual accept POST — see invitation-actions.ts). A Server Component
  // fetch never touches the browser at all, so it isn't subject to that.
  const result = await lookupInvitation(token);

  if (!result.ok) {
    // closedStateFor only recognizes the invitation-flow's own error
    // statuses (404/410/409/429) — anything else (401, 500, a network
    // failure) gets a safe generic message instead of the raw backend
    // `detail`, which is written for API consumers, not end users, and
    // could name an internal implementation detail.
    const state = closedStateFor(result.status, result.error);
    if (state) {
      return (
        <Message
          title={state.title}
          body={state.body}
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
    return (
      <Message
        title="Couldn't load this invitation"
        body="Something went wrong loading this invitation. Please try again, or ask whoever invited you to send a new link."
      />
    );
  }

  return <AcceptInvitationForm token={token} email={result.email} />;
}
