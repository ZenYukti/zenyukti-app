import { requireSession } from "@/lib/session";
import { apiFetch } from "@/lib/api";
import { ProfileView } from "@/components/ProfileView";
import type { CoreProfile } from "@/lib/types";

export default async function ProfilePage() {
  const session = await requireSession();

  const profile = await apiFetch<CoreProfile>(
    "/v1/me/profile",
    session.access_token,
  ).catch(() => null);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Your profile</h1>
        <p className="mt-1 text-sm text-muted">
          This is how your ZenYukti identity appears to other members.
        </p>
      </div>
      <ProfileView initialProfile={profile} email={session.user.email ?? ""} />
    </div>
  );
}
