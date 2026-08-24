import { requireSession } from "@/lib/session";
import { apiFetch, ApiError } from "@/lib/api";
import { Nav } from "@/components/Nav";
import { canManageInvitations, permissionKeys } from "@/lib/permissions";
import type { CoreUser, CorePermissionsResponse } from "@/lib/types";

export default async function AppLayout({ children }: LayoutProps<"/">) {
  const session = await requireSession();
  const token = session.access_token;

  let displayName = session.user.email ?? "ZenMate";
  let permissions: string[] = [];
  let apiUnreachable = false;

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
    if (err instanceof ApiError) {
      apiUnreachable = true;
    } else {
      throw err;
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Nav
        displayName={displayName}
        showInvitations={canManageInvitations(permissions)}
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
  );
}
