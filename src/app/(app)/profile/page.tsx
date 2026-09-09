import { requireSession } from "@/lib/session";
import { apiFetch } from "@/lib/api";
import { ProfileView } from "@/components/ProfileView";
import { FeaturedWorkEditor } from "@/components/FeaturedWorkEditor";
import type { CoreProfile, CoreFeaturedWorkListResponse } from "@/lib/types";

export default async function ProfilePage() {
  const session = await requireSession();
  const token = session.access_token;

  const [profile, featuredWork] = await Promise.all([
    apiFetch<CoreProfile>("/v1/me/profile", token).catch(() => null),
    apiFetch<CoreFeaturedWorkListResponse>("/v1/me/featured-work", token)
      .then((res) => res.featured_work)
      .catch(() => []),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Your profile</h1>
        <p className="mt-1 text-sm text-muted">
          Your ZenYukti identity — visible to other members if you choose
          to make it public.
        </p>
      </div>
      <ProfileView
        initialProfile={profile}
        email={session.user.email ?? ""}
        authUserId={session.user.id}
      />
      <div className="border-t border-border pt-6">
        <FeaturedWorkEditor initialItems={featuredWork} />
      </div>
    </div>
  );
}
