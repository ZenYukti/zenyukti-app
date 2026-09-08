import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const updateMock = vi.fn();
vi.mock("@/lib/public-team-actions", () => ({
  updatePublicTeamMembership: (...args: unknown[]) => updateMock(...args),
}));

const { PublicTeamMembership } = await import(
  "@/components/PublicTeamMembership"
);

beforeEach(() => {
  updateMock.mockReset();
});

describe("PublicTeamMembership — with public_team.manage", () => {
  it("renders the listed state with its display order", () => {
    render(
      <PublicTeamMembership
        memberId="user-1"
        initialPublicTeamMember={{ listed: true, display_order: 3 }}
        canManage
      />,
    );

    expect(screen.getByRole("checkbox")).toBeChecked();
    expect(screen.getByLabelText("Display order")).toHaveValue(3);
  });

  it("renders the unlisted state with no display order field", () => {
    render(
      <PublicTeamMembership
        memberId="user-1"
        initialPublicTeamMember={null}
        canManage
      />,
    );

    expect(screen.getByRole("checkbox")).not.toBeChecked();
    expect(screen.queryByLabelText("Display order")).not.toBeInTheDocument();
  });

  it("sends listed:true with the edited display order when adding", async () => {
    updateMock.mockResolvedValueOnce({
      ok: true,
      publicTeamMember: { listed: true, display_order: 5 },
    });
    const user = userEvent.setup();

    render(
      <PublicTeamMembership
        memberId="user-1"
        initialPublicTeamMember={null}
        canManage
      />,
    );

    await user.click(screen.getByRole("checkbox"));
    await user.clear(screen.getByLabelText("Display order"));
    await user.type(screen.getByLabelText("Display order"), "5");
    await user.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() =>
      expect(updateMock).toHaveBeenCalledWith("user-1", {
        listed: true,
        display_order: 5,
      }),
    );
  });

  it("sends only listed:false when removing — no display order", async () => {
    updateMock.mockResolvedValueOnce({ ok: true, publicTeamMember: null });
    const user = userEvent.setup();

    render(
      <PublicTeamMembership
        memberId="user-1"
        initialPublicTeamMember={{ listed: true, display_order: 3 }}
        canManage
      />,
    );

    await user.click(screen.getByRole("checkbox"));
    await user.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() =>
      expect(updateMock).toHaveBeenCalledWith("user-1", { listed: false }),
    );
  });

  it("disables the button and shows Saving… while the action is pending", async () => {
    let resolveAction!: (value: unknown) => void;
    updateMock.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveAction = resolve;
      }),
    );
    const user = userEvent.setup();

    render(
      <PublicTeamMembership
        memberId="user-1"
        initialPublicTeamMember={{ listed: true, display_order: 3 }}
        canManage
      />,
    );

    await user.clear(screen.getByLabelText("Display order"));
    await user.type(screen.getByLabelText("Display order"), "4");
    await user.click(screen.getByRole("button", { name: /save/i }));

    expect(screen.getByRole("button", { name: "Saving…" })).toBeDisabled();

    resolveAction({ ok: true, publicTeamMember: { listed: true, display_order: 4 } });

    // Once the save resolves, the button reverts to "Save" — it stays
    // disabled because the form is no longer dirty (nothing left to save),
    // not because a save is still pending.
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument(),
    );
  });

  it("shows the API error inline on failure, using the existing error style", async () => {
    updateMock.mockResolvedValueOnce({ ok: false, error: "Founders only." });
    const user = userEvent.setup();

    render(
      <PublicTeamMembership
        memberId="user-1"
        initialPublicTeamMember={{ listed: true, display_order: 3 }}
        canManage
      />,
    );

    await user.clear(screen.getByLabelText("Display order"));
    await user.type(screen.getByLabelText("Display order"), "9");
    await user.click(screen.getByRole("button", { name: /save/i }));

    const message = await screen.findByText("Founders only.");
    expect(message.className).toContain("text-red-500");
  });
});

describe("PublicTeamMembership — direct Remove action", () => {
  it("shows the destructive Remove button only when currently listed", () => {
    const { unmount } = render(
      <PublicTeamMembership
        memberId="user-1"
        initialPublicTeamMember={{ listed: true, display_order: 3 }}
        canManage
      />,
    );
    expect(
      screen.getByRole("button", { name: "Remove from public People page" }),
    ).toBeInTheDocument();
    unmount();

    render(
      <PublicTeamMembership
        memberId="user-1"
        initialPublicTeamMember={null}
        canManage
      />,
    );
    expect(
      screen.queryByRole("button", { name: "Remove from public People page" }),
    ).not.toBeInTheDocument();
  });

  it("asks for confirmation before removing, without calling the action yet", async () => {
    const user = userEvent.setup();
    render(
      <PublicTeamMembership
        memberId="user-1"
        initialPublicTeamMember={{ listed: true, display_order: 3 }}
        canManage
      />,
    );

    await user.click(
      screen.getByRole("button", { name: "Remove from public People page" }),
    );

    expect(
      screen.getByText(
        /does not delete their account, profile, or role/i,
      ),
    ).toBeInTheDocument();
    expect(updateMock).not.toHaveBeenCalled();
  });

  it("cancelling the confirmation leaves the member listed and calls nothing", async () => {
    const user = userEvent.setup();
    render(
      <PublicTeamMembership
        memberId="user-1"
        initialPublicTeamMember={{ listed: true, display_order: 3 }}
        canManage
      />,
    );

    await user.click(
      screen.getByRole("button", { name: "Remove from public People page" }),
    );
    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(updateMock).not.toHaveBeenCalled();
    expect(
      screen.getByRole("button", { name: "Remove from public People page" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("checkbox")).toBeChecked();
  });

  it("on confirm, sends {listed:false} and updates the UI to unlisted", async () => {
    updateMock.mockResolvedValueOnce({ ok: true, publicTeamMember: null });
    const user = userEvent.setup();

    render(
      <PublicTeamMembership
        memberId="user-1"
        initialPublicTeamMember={{ listed: true, display_order: 3 }}
        canManage
      />,
    );

    await user.click(
      screen.getByRole("button", { name: "Remove from public People page" }),
    );
    await user.click(screen.getByRole("button", { name: "Confirm removal" }));

    await waitFor(() =>
      expect(updateMock).toHaveBeenCalledWith("user-1", { listed: false }),
    );

    await waitFor(() => expect(screen.getByRole("checkbox")).not.toBeChecked());
    expect(screen.queryByLabelText("Display order")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Remove from public People page" }),
    ).not.toBeInTheDocument();
  });

  it("disables Confirm/Cancel and shows Removing… while the action is pending", async () => {
    let resolveAction!: (value: unknown) => void;
    updateMock.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveAction = resolve;
      }),
    );
    const user = userEvent.setup();

    render(
      <PublicTeamMembership
        memberId="user-1"
        initialPublicTeamMember={{ listed: true, display_order: 3 }}
        canManage
      />,
    );

    await user.click(
      screen.getByRole("button", { name: "Remove from public People page" }),
    );
    await user.click(screen.getByRole("button", { name: "Confirm removal" }));

    expect(screen.getByRole("button", { name: "Removing…" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled();

    resolveAction({ ok: true, publicTeamMember: null });
    await waitFor(() =>
      expect(
        screen.queryByRole("button", { name: "Removing…" }),
      ).not.toBeInTheDocument(),
    );
  });

  it("shows the API error inline and keeps the confirmation open on failure", async () => {
    updateMock.mockResolvedValueOnce({
      ok: false,
      error: "Founders only.",
    });
    const user = userEvent.setup();

    render(
      <PublicTeamMembership
        memberId="user-1"
        initialPublicTeamMember={{ listed: true, display_order: 3 }}
        canManage
      />,
    );

    await user.click(
      screen.getByRole("button", { name: "Remove from public People page" }),
    );
    await user.click(screen.getByRole("button", { name: "Confirm removal" }));

    const message = await screen.findByText("Founders only.");
    expect(message.className).toContain("text-red-500");
    // Still listed and still in the confirmation state — the removal did
    // not silently succeed on the frontend after a backend failure.
    expect(screen.getByRole("checkbox")).toBeChecked();
    expect(
      screen.getByRole("button", { name: "Confirm removal" }),
    ).toBeInTheDocument();
  });
});

describe("PublicTeamMembership — without public_team.manage", () => {
  it("renders a read-only indicator and no editable controls", () => {
    render(
      <PublicTeamMembership
        memberId="user-1"
        initialPublicTeamMember={{ listed: true, display_order: 3 }}
        canManage={false}
      />,
    );

    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /save/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByText(/listed on public people page \(order 3\)/i),
    ).toBeInTheDocument();
  });

  it("never calls the Server Action", () => {
    render(
      <PublicTeamMembership
        memberId="user-1"
        initialPublicTeamMember={null}
        canManage={false}
      />,
    );

    expect(updateMock).not.toHaveBeenCalled();
  });
});
