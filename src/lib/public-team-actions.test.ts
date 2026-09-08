import { beforeEach, describe, expect, it, vi } from "vitest";

const requireSessionMock = vi.fn();
const apiFetchMock = vi.fn();
const revalidatePathMock = vi.fn();

vi.mock("@/lib/session", () => ({
  requireSession: () => requireSessionMock(),
}));

vi.mock("@/lib/api", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api")>(
    "@/lib/api",
  );
  return {
    ...actual,
    apiFetch: (...args: unknown[]) => apiFetchMock(...args),
  };
});

vi.mock("next/cache", () => ({
  revalidatePath: (...args: unknown[]) => revalidatePathMock(...args),
}));

const { updatePublicTeamMembership } = await import(
  "@/lib/public-team-actions"
);
const { ApiError } = await import("@/lib/api");

beforeEach(() => {
  requireSessionMock.mockReset().mockResolvedValue({
    access_token: "token-123",
  });
  apiFetchMock.mockReset();
  revalidatePathMock.mockReset();
});

describe("updatePublicTeamMembership", () => {
  it("PATCHes listed:true with the display order and returns the backend's persisted state", async () => {
    apiFetchMock.mockResolvedValueOnce({
      public_team_member: { listed: true, display_order: 3 },
    });

    const result = await updatePublicTeamMembership("user-1", {
      listed: true,
      display_order: 3,
    });

    expect(apiFetchMock).toHaveBeenCalledWith(
      "/v1/users/user-1/public-team-membership",
      "token-123",
      { method: "PATCH", body: JSON.stringify({ listed: true, display_order: 3 }) },
    );
    expect(result).toEqual({
      ok: true,
      publicTeamMember: { listed: true, display_order: 3 },
    });
    expect(revalidatePathMock).toHaveBeenCalledWith("/members/user-1");
    expect(revalidatePathMock).toHaveBeenCalledWith("/members");
    expect(revalidatePathMock).toHaveBeenCalledWith("/team");
  });

  it("PATCHes only listed:false when removing — no fabricated display_order — and returns null from the response", async () => {
    apiFetchMock.mockResolvedValueOnce({ public_team_member: null });

    const result = await updatePublicTeamMembership("user-1", {
      listed: false,
    });

    expect(apiFetchMock).toHaveBeenCalledWith(
      "/v1/users/user-1/public-team-membership",
      "token-123",
      { method: "PATCH", body: JSON.stringify({ listed: false }) },
    );
    expect(result).toEqual({ ok: true, publicTeamMember: null });
  });

  it("returns the API error detail on failure", async () => {
    apiFetchMock.mockRejectedValueOnce(
      new ApiError(403, "Forbidden", "Founders only."),
    );

    const result = await updatePublicTeamMembership("user-1", {
      listed: true,
      display_order: 1,
    });

    expect(result).toEqual({ ok: false, error: "Founders only." });
  });

  it("falls back to a generic message for a non-API error", async () => {
    apiFetchMock.mockRejectedValueOnce(new Error("network down"));

    const result = await updatePublicTeamMembership("user-1", {
      listed: false,
    });

    expect(result).toEqual({
      ok: false,
      error: "Failed to update public Core Team membership.",
    });
  });
});
