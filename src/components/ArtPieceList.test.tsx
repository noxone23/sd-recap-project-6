import { render, screen } from "@testing-library/react";

import type { ArtPiece } from "../types";
import ArtPieceList from "./ArtPieceList";

const artPieces: ArtPiece[] = [
  {
    slug: "the-harvesters",
    name: "The Harvesters",
    artist: "Pieter Bruegel the Elder",
    imageSource: "https://example.com/the-harvesters.jpg",
  },
  {
    slug: "wheat-field-with-cypresses",
    name: "Wheat Field with Cypresses",
    artist: "Vincent van Gogh",
    imageSource: "https://example.com/wheat-field-with-cypresses.jpg",
  },
  {
    slug: "the-night-watch",
    name: "The Night Watch",
    artist: "Rembrandt van Rijn",
    imageSource: "https://example.com/the-night-watch.jpg",
  },
];

describe("ArtPieceList", () => {
  it("displays all art pieces in a list", () => {
    render(<ArtPieceList artPieces={artPieces} />);

    expect(screen.getByRole("list")).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
  });
});
