import { requireSession } from "@/lib/session";
import { apiFetch } from "@/lib/api";
import { InvitationsManager } from "@/components/InvitationsManager";
import { canManageInvitations } from "@/lib/permissions";
import type { CoreInvitation } from "@/lib/types";

export default async function InvitationsPage() {
  const session = await requireSession();
  const token = session.access_token;

  const [invitations, permissions] = await Promise.all([
    apiFetch<CoreInvitation[]>("/v1/invitations", token).catch(
      () => [] as CoreInvitation[],
    ),
    apiFetch<string[]>("/v1/me/permissions", token).catch(() => []),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Invitations</h1>
        <p className="mt-1 text-sm text-muted">
          Track and manage invitations into ZenYukti.
        </p>
      </div>
      <InvitationsManager
        initialInvitations={invitations}
        canManage={canManageInvitations(permissions)}
      />
    </div>
  );
}
