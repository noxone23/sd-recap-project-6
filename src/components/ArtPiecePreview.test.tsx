import { render, screen } from "@testing-library/react";

import type { ArtPiece } from "../types";
import ArtPiecePreview from "./ArtPiecePreview";

const artPiece: ArtPiece = {
  slug: "the-harvesters",
  name: "The Harvesters",
  artist: "Pieter Bruegel the Elder",
  imageSource: "https://example.com/the-harvesters.jpg",
};

describe("ArtPiecePreview", () => {
  it("displays the image of the art piece", () => {
    render(<ArtPiecePreview artPiece={artPiece} />);

    const image = screen.getByRole("img", { name: "The Harvesters" });
    expect(image).toHaveAttribute("src", artPiece.imageSource);
  });

  it("displays the title of the art piece", () => {
    render(<ArtPiecePreview artPiece={artPiece} />);

    expect(screen.getByText("The Harvesters")).toBeInTheDocument();
  });

  it("displays the name of the artist", () => {
    render(<ArtPiecePreview artPiece={artPiece} />);

    expect(screen.getByText("Pieter Bruegel the Elder")).toBeInTheDocument();
  });
});
