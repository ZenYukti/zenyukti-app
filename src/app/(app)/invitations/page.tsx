import { requireSession } from "@/lib/session";
import { apiFetch, ApiError } from "@/lib/api";
import { InvitationsManager } from "@/components/InvitationsManager";
import { canManageInvitations, permissionKeys } from "@/lib/permissions";
import type {
  CoreInvitation,
  CoreInvitationsResponse,
  CorePermissionsResponse,
} from "@/lib/types";

export default async function InvitationsPage() {
  const session = await requireSession();
  const token = session.access_token;

  let invitations: CoreInvitation[] = [];
  let loadError: string | null = null;

  const perms = await apiFetch<CorePermissionsResponse>(
    "/v1/me/permissions",
    token,
  ).catch(() => null);
  const permissions = permissionKeys(perms);
  const canManage = canManageInvitations(permissions);

  try {
    const res = await apiFetch<CoreInvitationsResponse>(
      "/v1/invitations",
      token,
    );
    invitations = res.invitations;
  } catch (err) {
    loadError =
      err instanceof ApiError
        ? err.status === 403
          ? "You don't have permission to view invitations."
          : err.detail || err.message
        : "Couldn't load invitations.";
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Invitations</h1>
        <p className="mt-1 text-sm text-muted">
          Track and manage invitations into ZenYukti.
        </p>
      </div>
      {loadError ? (
        <p className="rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-500">
          {loadError}
        </p>
      ) : (
        <InvitationsManager
          initialInvitations={invitations}
          canManage={canManage}
        />
      )}
    </div>
  );
}
