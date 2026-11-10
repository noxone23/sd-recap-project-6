import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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
  colors: ["#37412E", "#8D7332"],
};

function renderDetails() {
  return render(
    <MemoryRouter>
      <ArtPieceDetails
        artPiece={artPiece}
        isFavorite={false}
        onToggleFavorite={() => {}}
        comments={[
          { text: "Beautiful colors", date: "2026-11-09T10:15:00.000Z" },
        ]}
        onAddComment={() => {}}
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

  it("displays the color palette with the colors of the art piece", () => {
    renderDetails();

    const palette = screen.getByRole("list", { name: "Color palette" });
    expect(within(palette).getAllByRole("listitem")).toHaveLength(
      artPiece.colors.length
    );
  });

  it("displays the comments section with the comments", () => {
    renderDetails();

    expect(
      screen.getByRole("region", { name: "Comments" })
    ).toBeInTheDocument();
    expect(screen.getByText("Beautiful colors")).toBeInTheDocument();
  });

  it("displays the comment form", () => {
    renderDetails();

    expect(
      screen.getByRole("textbox", { name: "Comment" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Add comment" })
    ).toBeInTheDocument();
  });

  it("displays a back button that links to the list", () => {
    renderDetails();

    expect(screen.getByRole("link", { name: "Back" })).toHaveAttribute(
      "href",
      "/art-pieces"
    );
  });

  it("calls onToggleFavorite when the favorite button is clicked", async () => {
    const onToggleFavorite = vi.fn();
    render(
      <MemoryRouter>
        <ArtPieceDetails
          artPiece={artPiece}
          isFavorite={false}
          onToggleFavorite={onToggleFavorite}
          comments={[]}
          onAddComment={() => {}}
        />
      </MemoryRouter>
    );

    await userEvent.click(
      screen.getByRole("button", { name: "Favorite The Harvesters" })
    );

    expect(onToggleFavorite).toHaveBeenCalledTimes(1);
  });

  it("calls onAddComment with the text when the comment form is submitted", async () => {
    const onAddComment = vi.fn();
    render(
      <MemoryRouter>
        <ArtPieceDetails
          artPiece={artPiece}
          isFavorite={false}
          onToggleFavorite={() => {}}
          comments={[]}
          onAddComment={onAddComment}
        />
      </MemoryRouter>
    );

    await userEvent.type(
      screen.getByRole("textbox", { name: "Comment" }),
      "Lovely light"
    );
    await userEvent.click(screen.getByRole("button", { name: "Add comment" }));

    expect(onAddComment).toHaveBeenCalledWith("Lovely light");
  });
});
