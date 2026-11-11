import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes, useLocation } from "react-router";

import type { ArtPiece } from "../types";
import ArtPiecePreview from "./ArtPiecePreview";

const artPiece: ArtPiece = {
  slug: "the-harvesters",
  name: "The Harvesters",
  artist: "Pieter Bruegel the Elder",
  imageSource: "https://example.com/the-harvesters.jpg",
  year: "1565",
  genre: "Renaissance",
  colors: ["#37412E", "#8D7332"],
};

function renderPreview() {
  return render(
    <MemoryRouter>
      <ArtPiecePreview
        artPiece={artPiece}
        isFavorite={false}
        onToggleFavorite={() => {}}
      />
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

  it("displays the favorite button", () => {
    renderPreview();

    expect(
      screen.getByRole("button", { name: "Favorite The Harvesters" })
    ).toBeInTheDocument();
  });

  it("marks the favorite button as pressed when the art piece is a favorite", () => {
    render(
      <MemoryRouter>
        <ArtPiecePreview
          artPiece={artPiece}
          isFavorite={true}
          onToggleFavorite={() => {}}
        />
      </MemoryRouter>
    );

    expect(
      screen.getByRole("button", { name: "Favorite The Harvesters" })
    ).toHaveAttribute("aria-pressed", "true");
  });

  it("calls onToggleFavorite when the favorite button is clicked", async () => {
    const onToggleFavorite = vi.fn();
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <ArtPiecePreview
          artPiece={artPiece}
          isFavorite={false}
          onToggleFavorite={onToggleFavorite}
        />
      </MemoryRouter>
    );

    await user.click(
      screen.getByRole("button", { name: "Favorite The Harvesters" })
    );

    expect(onToggleFavorite).toHaveBeenCalledTimes(1);
  });

  it("links to the details page of the art piece", () => {
    renderPreview();

    expect(
      screen.getByRole("link", { name: /The Harvesters/ })
    ).toHaveAttribute("href", "/art-pieces/the-harvesters");
  });

  it("passes the current path and search to the details page as state", async () => {
    function StateDisplay() {
      const { state } = useLocation() as { state: { from: string } };

      return <p>Came from {state.from}</p>;
    }

    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={["/art-pieces?q=gogh"]}>
        <Routes>
          <Route
            path="/art-pieces"
            element={
              <ArtPiecePreview
                artPiece={artPiece}
                isFavorite={false}
                onToggleFavorite={() => {}}
              />
            }
          />
          <Route path="/art-pieces/:slug" element={<StateDisplay />} />
        </Routes>
      </MemoryRouter>
    );

    await user.click(screen.getByRole("link", { name: /The Harvesters/ }));

    expect(
      screen.getByText("Came from /art-pieces?q=gogh")
    ).toBeInTheDocument();
  });
});
