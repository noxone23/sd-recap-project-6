import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";

import type { ArtPiece } from "../types";
import Spotlight from "./Spotlight";

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

function mockRandom(fraction: number) {
  return vi.spyOn(crypto, "getRandomValues").mockImplementation((array) => {
    (array as Uint32Array)[0] = Math.floor(fraction * 2 ** 32);
    return array;
  });
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("Spotlight", () => {
  it("displays the image of the selected art piece", () => {
    mockRandom(0);

    render(
      <MemoryRouter>
        <Spotlight
          artPieces={artPieces}
          isFavorite={() => false}
          onToggleFavorite={() => {}}
        />
      </MemoryRouter>
    );

    const image = screen.getByRole("img", { name: "The Harvesters" });
    expect(image).toHaveAttribute("src", artPieces[0].imageSource);
  });

  it("links the image to the details page of the selected art piece", () => {
    mockRandom(0.999);

    render(
      <MemoryRouter>
        <Spotlight
          artPieces={artPieces}
          isFavorite={() => false}
          onToggleFavorite={() => {}}
        />
      </MemoryRouter>
    );

    expect(
      screen.getByRole("link", { name: "Wheat Field with Cypresses" })
    ).toHaveAttribute("href", "/art-pieces/wheat-field-with-cypresses");
  });

  it("displays the name of the selected art piece as a heading", () => {
    mockRandom(0.999);

    render(
      <MemoryRouter>
        <Spotlight
          artPieces={artPieces}
          isFavorite={() => false}
          onToggleFavorite={() => {}}
        />
      </MemoryRouter>
    );

    expect(
      screen.getByRole("heading", { name: "Wheat Field with Cypresses" })
    ).toBeInTheDocument();
  });

  it("displays the name of the artist of the selected art piece", () => {
    mockRandom(0.999);

    render(
      <MemoryRouter>
        <Spotlight
          artPieces={artPieces}
          isFavorite={() => false}
          onToggleFavorite={() => {}}
        />
      </MemoryRouter>
    );

    expect(screen.getByText("Vincent van Gogh")).toBeInTheDocument();
  });

  it("displays the favorite button of the selected art piece", () => {
    mockRandom(0.999);

    render(
      <MemoryRouter>
        <Spotlight
          artPieces={artPieces}
          isFavorite={() => false}
          onToggleFavorite={() => {}}
        />
      </MemoryRouter>
    );

    expect(
      screen.getByRole("button", {
        name: "Favorite Wheat Field with Cypresses",
      })
    ).toBeInTheDocument();
  });

  it("marks the favorite button as pressed when the art piece is a favorite", () => {
    mockRandom(0.999);

    render(
      <MemoryRouter>
        <Spotlight
          artPieces={artPieces}
          isFavorite={(slug) => slug === "wheat-field-with-cypresses"}
          onToggleFavorite={() => {}}
        />
      </MemoryRouter>
    );

    expect(
      screen.getByRole("button", {
        name: "Favorite Wheat Field with Cypresses",
      })
    ).toHaveAttribute("aria-pressed", "true");
  });

  it("toggles the favorite of the selected art piece by its slug", async () => {
    mockRandom(0.999);
    const onToggleFavorite = vi.fn();
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Spotlight
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

  it("keeps the same art piece when it renders again", () => {
    mockRandom(0);
    const { rerender } = render(
      <MemoryRouter>
        <Spotlight
          artPieces={artPieces}
          isFavorite={() => false}
          onToggleFavorite={() => {}}
        />
      </MemoryRouter>
    );

    mockRandom(0.999);
    rerender(
      <MemoryRouter>
        <Spotlight
          artPieces={artPieces}
          isFavorite={() => false}
          onToggleFavorite={() => {}}
        />
      </MemoryRouter>
    );

    expect(screen.getByText("Pieter Bruegel the Elder")).toBeInTheDocument();
    expect(screen.queryByText("Vincent van Gogh")).not.toBeInTheDocument();
  });

  it("renders nothing when there are no art pieces", () => {
    const { container } = render(
      <MemoryRouter>
        <Spotlight
          artPieces={[]}
          isFavorite={() => false}
          onToggleFavorite={() => {}}
        />
      </MemoryRouter>
    );

    expect(container).toBeEmptyDOMElement();
  });
});
