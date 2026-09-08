import { describe, expect, it } from "vitest";
import { canManagePublicTeam, permissionKeys } from "@/lib/permissions";

describe("canManagePublicTeam", () => {
  it("returns true when public_team:manage is present", () => {
    expect(canManagePublicTeam(["public_team:manage"])).toBe(true);
  });

  it("returns false when the permission is absent", () => {
    expect(canManagePublicTeam(["users:view"])).toBe(false);
  });

  it("returns false for an empty permission set", () => {
    expect(canManagePublicTeam([])).toBe(false);
  });

  it("does not treat standing-role-shaped keys as a substitute", () => {
    // The backend deliberately keeps Founder/ZenCrew/ZenMate separate from
    // public_team.manage — this must never be inferred from a role slug.
    expect(canManagePublicTeam(["founder:manage", "zencrew:manage"])).toBe(
      false,
    );
  });

  it("recognizes the permission as returned by GET /v1/me/permissions", () => {
    const keys = permissionKeys({
      permissions: [
        { resource: "public_team", action: "manage", scope_type: "global" },
      ],
    });
    expect(canManagePublicTeam(keys)).toBe(true);
  });
});
