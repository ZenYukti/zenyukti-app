/**
 * Maps a failed invitation lookup/accept (status + detail from the real
 * API response) to user-facing copy. Shared between the server-side
 * token lookup (app/invitations/accept/page.tsx) and the client-side
 * accept submission (components/AcceptInvitationForm.tsx) — same status
 * codes, same meaning, in both places.
 */
export function closedStateFor(status: number | undefined, detail: string) {
  switch (status) {
    case 404:
      return {
        title: "Invalid invitation link",
        body: "This invitation link isn't recognized. Double-check you copied the full link from your email, or ask whoever invited you to send a new one.",
      };
    case 410:
      return detail.includes("revoked")
        ? {
            title: "Invitation revoked",
            body: "This invitation has been revoked. Ask a ZenYukti Founder or ZenCrew member to send you a new one.",
          }
        : {
            title: "Invitation expired",
            body: "This invitation link has expired (invitations are valid for 7 days). Ask whoever invited you to send a new one.",
          };
    case 409:
      return {
        title: "Already set up",
        body: "This invitation has already been used to create an account. If that was you, sign in below.",
      };
    case 429:
      return {
        title: "Too many attempts",
        body: "Too many attempts from this connection. Wait a few minutes and try again.",
      };
    default:
      return null;
  }
}
