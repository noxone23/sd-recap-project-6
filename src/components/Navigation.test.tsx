import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";

import Navigation from "./Navigation";

function renderNavigation(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Navigation />
    </MemoryRouter>
  );
}

describe("Navigation", () => {
  it("displays a link labeled Spotlight to the route /", () => {
    renderNavigation("/");

    expect(screen.getByRole("link", { name: "Spotlight" })).toHaveAttribute(
      "href",
      "/"
    );
  });

  it("displays a link labeled Gallery to the route /art-pieces", () => {
    renderNavigation("/");

    expect(screen.getByRole("link", { name: "Gallery" })).toHaveAttribute(
      "href",
      "/art-pieces"
    );
  });

  it("displays a link labeled Favorites to the route /favorites", () => {
    renderNavigation("/");

    expect(screen.getByRole("link", { name: "Favorites" })).toHaveAttribute(
      "href",
      "/favorites"
    );
  });

  it("highlights only the Spotlight link on the route /", () => {
    renderNavigation("/");

    expect(screen.getByRole("link", { name: "Spotlight" })).toHaveClass(
      "active"
    );
    expect(screen.getByRole("link", { name: "Gallery" })).not.toHaveClass(
      "active"
    );
  });

  it("highlights only the Gallery link on the route /art-pieces", () => {
    renderNavigation("/art-pieces");

    expect(screen.getByRole("link", { name: "Gallery" })).toHaveClass("active");
    expect(screen.getByRole("link", { name: "Spotlight" })).not.toHaveClass(
      "active"
    );
  });

  it("highlights only the Favorites link on the route /favorites", () => {
    renderNavigation("/favorites");

    expect(screen.getByRole("link", { name: "Favorites" })).toHaveClass(
      "active"
    );
    expect(screen.getByRole("link", { name: "Spotlight" })).not.toHaveClass(
      "active"
    );
  });
});
