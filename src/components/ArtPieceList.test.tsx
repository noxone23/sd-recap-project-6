import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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
        <ArtPieceList
          artPieces={artPieces}
          isFavorite={() => false}
          onToggleFavorite={() => {}}
        />
      </MemoryRouter>
    );

    expect(screen.getByRole("list")).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
  });

  it("displays a favorite button on each entry", () => {
    render(
      <MemoryRouter>
        <ArtPieceList
          artPieces={artPieces}
          isFavorite={() => false}
          onToggleFavorite={() => {}}
        />
      </MemoryRouter>
    );

    expect(screen.getAllByRole("button")).toHaveLength(3);
  });

  it("marks only the favorite art pieces as pressed", () => {
    render(
      <MemoryRouter>
        <ArtPieceList
          artPieces={artPieces}
          isFavorite={(slug) => slug === "the-night-watch"}
          onToggleFavorite={() => {}}
        />
      </MemoryRouter>
    );

    expect(
      screen.getByRole("button", { name: "Favorite The Night Watch" })
    ).toHaveAttribute("aria-pressed", "true");
    expect(
      screen.getByRole("button", { name: "Favorite The Harvesters" })
    ).toHaveAttribute("aria-pressed", "false");
  });

  it("toggles the favorite of the clicked art piece by its slug", async () => {
    const onToggleFavorite = vi.fn();
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <ArtPieceList
          artPieces={artPieces}
          isFavorite={() => false}
          onToggleFavorite={onToggleFavorite}
        />
      </MemoryRouter>
    );

    await user.click(
      screen.getByRole("button", {
        name: "Favorite Wheat Field with Cypresses",
      })
    );

    expect(onToggleFavorite).toHaveBeenCalledTimes(1);
    expect(onToggleFavorite).toHaveBeenCalledWith("wheat-field-with-cypresses");
  });
});
