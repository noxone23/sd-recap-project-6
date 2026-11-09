import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";

import type { ArtPiece } from "../types";
import ArtPiecePreview from "./ArtPiecePreview";

const artPiece: ArtPiece = {
  slug: "the-harvesters",
  name: "The Harvesters",
  artist: "Pieter Bruegel the Elder",
  imageSource: "https://example.com/the-harvesters.jpg",
  year: "1565",
  genre: "Renaissance",
};

function renderPreview() {
  return render(
    <MemoryRouter>
      <ArtPiecePreview artPiece={artPiece} />
    </MemoryRouter>
  );
}

describe("ArtPiecePreview", () => {
  it("displays the image of the art piece", () => {
    renderPreview();

    const image = screen.getByRole("img", { name: "The Harvesters" });
    expect(image).toHaveAttribute("src", artPiece.imageSource);
  });

  it("displays the title of the art piece", () => {
    renderPreview();

    expect(screen.getByText("The Harvesters")).toBeInTheDocument();
  });

  it("displays the name of the artist", () => {
    renderPreview();

    expect(screen.getByText("Pieter Bruegel the Elder")).toBeInTheDocument();
  });

  it("links to the details page of the art piece", () => {
    renderPreview();

    expect(
      screen.getByRole("link", { name: /The Harvesters/ })
    ).toHaveAttribute("href", "/art-pieces/the-harvesters");
  });
});
