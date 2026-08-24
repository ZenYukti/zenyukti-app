import type { CorePermission, CorePermissionsResponse } from "@/lib/types";

/**
 * GET /v1/me/permissions returns `{ permissions: [{ resource, action, ... }] }`,
 * not a flat string array (confirmed against zenyukti-os). Normalizes that
 * into "resource:action" keys for matches() below, and tolerates a missing
 * or malformed response instead of throwing.
 */
export function permissionKeys(
  response: CorePermissionsResponse | null | undefined,
): string[] {
  if (!response || !Array.isArray(response.permissions)) return [];
  return response.permissions
    .filter(
      (p): p is CorePermission =>
        typeof p?.resource === "string" && typeof p?.action === "string",
    )
    .map((p) => `${p.resource}:${p.action}`);
}

/**
 * Checking several plausible key spellings keeps this from silently hiding
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

/**
 * GET /v1/users and /v1/users/:id both require "users.view" (see
 * zenyukti-os cmd/api/router.go) — confirmed, not guessed, so this checks
 * exactly that key.
 */
export function canViewMembers(permissions: string[]) {
  return matches(permissions, ["users:view"]);
}
