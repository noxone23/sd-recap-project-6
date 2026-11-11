import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";

import NotFound from "./NotFound";

describe("NotFound", () => {
  it("displays the message", () => {
    render(
      <MemoryRouter>
        <NotFound message="Page not found" />
      </MemoryRouter>
    );

    expect(screen.getByText("Page not found")).toBeInTheDocument();
  });

  it("displays a link back to the gallery", () => {
    render(
      <MemoryRouter>
        <NotFound message="Page not found" />
      </MemoryRouter>
    );

    expect(
      screen.getByRole("link", { name: "Back to gallery" })
    ).toHaveAttribute("href", "/art-pieces");
  });
});
