import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";

import type { ArtPiece } from "../types";
import ArtPieceDetails from "./ArtPieceDetails";

const artPiece: ArtPiece = {
  slug: "the-harvesters",
  name: "The Harvesters",
  artist: "Pieter Bruegel the Elder",
  imageSource: "https://example.com/the-harvesters.jpg",
  year: "1565",
  genre: "Renaissance",
};

function renderDetails() {
  return render(
    <MemoryRouter>
      <ArtPieceDetails
        artPiece={artPiece}
        isFavorite={false}
        onToggleFavorite={() => {}}
      />
    </MemoryRouter>
  );
}

describe("ArtPieceDetails", () => {
  it("displays the image of the art piece", () => {
    renderDetails();

    const image = screen.getByRole("img", { name: "The Harvesters" });
    expect(image).toHaveAttribute("src", artPiece.imageSource);
  });

  it("displays the title of the art piece", () => {
    renderDetails();

    expect(
      screen.getByRole("heading", { name: "The Harvesters" })
    ).toBeInTheDocument();
  });

  it.each([
    ["artist", "Pieter Bruegel the Elder"],
    ["year", "1565"],
    ["genre", "Renaissance"],
  ])("displays the %s of the art piece", (_field, text) => {
    renderDetails();

    expect(screen.getByText(text)).toBeInTheDocument();
  });

  it("displays the favorite button", () => {
    renderDetails();

    expect(
      screen.getByRole("button", { name: "Favorite The Harvesters" })
    ).toBeInTheDocument();
  });

  it("displays a back button that links to the list", () => {
    renderDetails();

    expect(screen.getByRole("link", { name: "Back" })).toHaveAttribute(
      "href",
      "/art-pieces"
    );
  });
});
