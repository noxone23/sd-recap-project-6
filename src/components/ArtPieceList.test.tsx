import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";

import type { ArtPiece } from "../types";
import ArtPieceList from "./ArtPieceList";

const artPieces: ArtPiece[] = [
  {
    slug: "the-harvesters",
    name: "The Harvesters",
    artist: "Pieter Bruegel the Elder",
    imageSource: "https://example.com/the-harvesters.jpg",
    year: "1565",
    genre: "Renaissance",
  },
  {
    slug: "wheat-field-with-cypresses",
    name: "Wheat Field with Cypresses",
    artist: "Vincent van Gogh",
    imageSource: "https://example.com/wheat-field-with-cypresses.jpg",
    year: "1889",
    genre: "Post-Impressionism",
  },
  {
    slug: "the-night-watch",
    name: "The Night Watch",
    artist: "Rembrandt van Rijn",
    imageSource: "https://example.com/the-night-watch.jpg",
    year: "1642",
    genre: "Baroque",
  },
];

describe("ArtPieceList", () => {
  it("displays all art pieces in a list", () => {
    render(
      <MemoryRouter>
        <ArtPieceList artPieces={artPieces} />
      </MemoryRouter>
    );

    expect(screen.getByRole("list")).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
  });
});
