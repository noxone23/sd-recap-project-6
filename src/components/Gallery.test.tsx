import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";

import type { ArtPiece } from "../types";
import Gallery from "./Gallery";

const artPieces: ArtPiece[] = [
  {
    slug: "the-harvesters",
    name: "The Harvesters",
    artist: "Pieter Bruegel the Elder",
    imageSource: "https://example.com/the-harvesters.jpg",
    year: "1565",
    genre: "Renaissance",
    colors: ["#37412E", "#8D7332"],
  },
  {
    slug: "wheat-field-with-cypresses",
    name: "Wheat Field with Cypresses",
    artist: "Vincent van Gogh",
    imageSource: "https://example.com/wheat-field-with-cypresses.jpg",
    year: "1889",
    genre: "Post-Impressionism",
    colors: ["#37412E", "#8D7332"],
  },
];

function renderGallery(onToggleFavorite = () => {}) {
  return render(
    <MemoryRouter>
      <Gallery
        artPieces={artPieces}
        isFavorite={() => false}
        onToggleFavorite={onToggleFavorite}
      />
    </MemoryRouter>
  );
}

describe("Gallery", () => {
  it("displays the search field and all art pieces at first", () => {
    renderGallery();

    expect(screen.getByRole("searchbox", { name: "Search" })).toHaveValue("");
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });

  it("displays only the art pieces that match the typed text", async () => {
    const user = userEvent.setup();
    renderGallery();

    await user.type(screen.getByRole("searchbox", { name: "Search" }), "wheat");

    expect(screen.getAllByRole("listitem")).toHaveLength(1);
    expect(
      screen.getByRole("link", { name: /Wheat Field with Cypresses/ })
    ).toBeInTheDocument();
    expect(screen.queryByText("The Harvesters")).not.toBeInTheDocument();
  });

  it("finds art pieces by artist and ignores the case", async () => {
    const user = userEvent.setup();
    renderGallery();

    await user.type(
      screen.getByRole("searchbox", { name: "Search" }),
      "BRUEGEL"
    );

    expect(screen.getAllByRole("listitem")).toHaveLength(1);
    expect(screen.getByText("The Harvesters")).toBeInTheDocument();
  });

  it("displays all art pieces again when the text is cleared", async () => {
    const user = userEvent.setup();
    renderGallery();
    const searchField = screen.getByRole("searchbox", { name: "Search" });

    await user.type(searchField, "wheat");
    await user.clear(searchField);

    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });

  it("displays a message and keeps the search field when nothing matches", async () => {
    const user = userEvent.setup();
    renderGallery();

    await user.type(screen.getByRole("searchbox", { name: "Search" }), "monet");

    expect(screen.getByText("No art pieces found")).toBeInTheDocument();
    expect(screen.queryByRole("listitem")).not.toBeInTheDocument();
    expect(
      screen.getByRole("searchbox", { name: "Search" })
    ).toBeInTheDocument();
  });

  it("toggles the favorite of a found art piece by its slug", async () => {
    const onToggleFavorite = vi.fn();
    const user = userEvent.setup();
    renderGallery(onToggleFavorite);

    await user.type(screen.getByRole("searchbox", { name: "Search" }), "wheat");
    await user.click(
      screen.getByRole("button", {
        name: "Favorite Wheat Field with Cypresses",
      })
    );

    expect(onToggleFavorite).toHaveBeenCalledWith("wheat-field-with-cypresses");
  });
});
