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

function renderGallery(
  query = "",
  onToggleFavorite = () => {},
  genre = "",
  onGenreChange: (genre: string) => void = () => {}
) {
  return render(
    <MemoryRouter>
      <Gallery
        artPieces={artPieces}
        query={query}
        genre={genre}
        onGenreChange={onGenreChange}
        isFavorite={() => false}
        onToggleFavorite={onToggleFavorite}
      />
    </MemoryRouter>
  );
}

describe("Gallery", () => {
  it("has no search field of its own", () => {
    renderGallery();

    expect(screen.queryByRole("searchbox")).not.toBeInTheDocument();
  });

  it("displays all art pieces when the query is empty", () => {
    renderGallery("");

    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });

  it("displays only the art pieces whose title matches the query", () => {
    renderGallery("wheat");

    expect(screen.getAllByRole("listitem")).toHaveLength(1);
    expect(
      screen.getByRole("link", { name: /Wheat Field with Cypresses/ })
    ).toBeInTheDocument();
    expect(screen.queryByText("The Harvesters")).not.toBeInTheDocument();
  });

  it("finds art pieces by artist and ignores the case and the outer spaces", () => {
    renderGallery("  BRUEGEL ");

    expect(screen.getAllByRole("listitem")).toHaveLength(1);
    expect(screen.getByText("The Harvesters")).toBeInTheDocument();
  });

  it("displays a message as a status when nothing matches", () => {
    renderGallery("monet");

    expect(screen.getByRole("status")).toHaveTextContent("No art pieces found");
    expect(screen.queryByRole("listitem")).not.toBeInTheDocument();
  });

  it("has a genre control with All genres and the genres of the art pieces", () => {
    renderGallery();

    expect(screen.getByRole("combobox", { name: "Genre" })).toBeInTheDocument();
    expect(
      screen.getAllByRole("option").map((option) => option.textContent)
    ).toEqual(["All genres", "Post-Impressionism", "Renaissance"]);
  });

  it("displays all art pieces when no genre is selected", () => {
    renderGallery();

    expect(screen.getByRole("combobox", { name: "Genre" })).toHaveValue("");
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });

  it("displays only the art pieces of the selected genre", () => {
    renderGallery("", () => {}, "Renaissance");

    expect(screen.getAllByRole("listitem")).toHaveLength(1);
    expect(screen.getByText("The Harvesters")).toBeInTheDocument();
    expect(
      screen.queryByText("Wheat Field with Cypresses")
    ).not.toBeInTheDocument();
  });

  it("displays only the art pieces that match the query and the genre", () => {
    renderGallery("wheat", () => {}, "Renaissance");

    expect(screen.getByRole("status")).toHaveTextContent("No art pieces found");
    expect(screen.queryByRole("listitem")).not.toBeInTheDocument();
  });

  it("keeps the genre control when nothing matches", () => {
    renderGallery("monet", () => {}, "Renaissance");

    expect(screen.getByRole("combobox", { name: "Genre" })).toHaveValue(
      "Renaissance"
    );
  });

  it("calls onGenreChange with the selected genre", async () => {
    const onGenreChange = vi.fn();
    const user = userEvent.setup();
    renderGallery("", () => {}, "", onGenreChange);

    await user.selectOptions(
      screen.getByRole("combobox", { name: "Genre" }),
      "Renaissance"
    );

    expect(onGenreChange).toHaveBeenCalledWith("Renaissance");
  });

  it("toggles the favorite of a found art piece by its slug", async () => {
    const onToggleFavorite = vi.fn();
    const user = userEvent.setup();
    renderGallery("wheat", onToggleFavorite);

    await user.click(
      screen.getByRole("button", {
        name: "Favorite Wheat Field with Cypresses",
      })
    );

    expect(onToggleFavorite).toHaveBeenCalledWith("wheat-field-with-cypresses");
  });
});
