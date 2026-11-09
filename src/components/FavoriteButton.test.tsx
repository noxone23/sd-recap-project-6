import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import FavoriteButton from "./FavoriteButton";

describe("FavoriteButton", () => {
  it("is labelled with the name of the art piece", () => {
    render(
      <FavoriteButton
        name="The Harvesters"
        isFavorite={false}
        onToggle={() => {}}
      />
    );

    expect(
      screen.getByRole("button", { name: "Favorite The Harvesters" })
    ).toBeInTheDocument();
  });

  it.each([
    [false, "false"],
    [true, "true"],
  ])("sets aria-pressed for isFavorite=%s", (isFavorite, pressed) => {
    render(
      <FavoriteButton
        name="The Harvesters"
        isFavorite={isFavorite}
        onToggle={() => {}}
      />
    );

    expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", pressed);
  });

  it("calls onToggle when it is clicked", async () => {
    const onToggle = vi.fn();
    const user = userEvent.setup();
    render(
      <FavoriteButton
        name="The Harvesters"
        isFavorite={false}
        onToggle={onToggle}
      />
    );

    await user.click(screen.getByRole("button"));

    expect(onToggle).toHaveBeenCalledTimes(1);
  });
});
