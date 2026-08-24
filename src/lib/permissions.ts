/**
 * Permission key names returned by GET /v1/me/permissions haven't been
 * verified against a live response (see note in lib/types.ts). Checking
 * several plausible key spellings keeps this from silently hiding
 * management UI if the real key differs slightly — the backend still
 * enforces the actual rule, this only controls whether we show the button.
 */
function matches(permissions: string[], candidates: string[]) {
  return candidates.some((c) => permissions.includes(c));
}

export function canManageInvitations(permissions: string[]) {
  return matches(permissions, [
    "invitations:issue",
    "invitations:write",
    "invitations:manage",
    "invitations:create",
  ]);
}

export function canViewMembers(permissions: string[]) {
  return matches(permissions, [
    "users:list",
    "users:read",
    "members:list",
    "members:read",
  ]);
}
