import { render, screen } from "@testing-library/react";

import ColorPalette from "./ColorPalette";

const colors = ["#37412E", "#8D7332", "#838665"];

describe("ColorPalette", () => {
  it("displays a list labeled Color palette", () => {
    render(<ColorPalette colors={colors} />);

    expect(
      screen.getByRole("list", { name: "Color palette" })
    ).toBeInTheDocument();
  });

  it("displays a list item for each color", () => {
    render(<ColorPalette colors={colors} />);

    expect(screen.getAllByRole("listitem")).toHaveLength(3);
  });

  it("displays each color as the background of its list item", () => {
    render(<ColorPalette colors={colors} />);

    const items = screen.getAllByRole("listitem");
    colors.forEach((color, index) => {
      expect(items[index]).toHaveStyle({ backgroundColor: color });
    });
  });
});
