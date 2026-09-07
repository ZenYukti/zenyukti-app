import { requireSession } from "@/lib/session";
import { apiFetch, ApiError, ApiUnavailableError } from "@/lib/api";
import { Nav } from "@/components/Nav";
import { ApiBootGate } from "@/components/ApiBootGate";
import {
  canManageInvitations,
  canViewMembers,
  permissionKeys,
} from "@/lib/permissions";
import type { CoreUser, CorePermissionsResponse } from "@/lib/types";

export default async function AppLayout({ children }: LayoutProps<"/">) {
  const session = await requireSession();
  const token = session.access_token;

  let displayName = session.user.email ?? "ZenMate";
  let permissions: string[] = [];
  let apiUnreachable = false;
  // API is reachable but responded with an error (401/403/5xx, etc.) —
  // the existing banner below. Distinct from apiBooting, which means the
  // API couldn't be reached at all (see ApiUnavailableError) and is
  // handled by the boot overlay instead.
  let apiBooting = false;

  try {
    const [me, perms] = await Promise.all([
      apiFetch<CoreUser>("/v1/me", token),
      apiFetch<CorePermissionsResponse>("/v1/me/permissions", token).catch(
        () => null,
      ),
    ]);
    displayName = me.email ?? displayName;
    permissions = permissionKeys(perms);
  } catch (err) {
    if (err instanceof ApiUnavailableError) {
      apiBooting = true;
    } else if (err instanceof ApiError) {
      apiUnreachable = true;
    } else {
      throw err;
    }
  }

  return (
    <>
      <div inert={apiBooting} className="flex min-h-screen flex-col">
        <Nav
          displayName={displayName}
          showInvitations={canManageInvitations(permissions)}
          showMembers={canViewMembers(permissions)}
        />
        {apiUnreachable && (
          <div className="border-b border-border bg-surface px-4 py-2 text-center text-sm text-muted sm:px-6">
            Couldn&apos;t reach the ZenYukti API right now — some data may be
            unavailable.
          </div>
        )}
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">
          {children}
        </main>
      </div>
      <ApiBootGate apiUnavailable={apiBooting} />
    </>
  );
}
