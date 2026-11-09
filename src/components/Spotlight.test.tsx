import { render, screen } from "@testing-library/react";

import type { ArtPiece } from "../types";
import Spotlight from "./Spotlight";

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

    render(<Spotlight artPieces={artPieces} />);

    const image = screen.getByRole("img", { name: "The Harvesters" });
    expect(image).toHaveAttribute("src", artPieces[0].imageSource);
  });

  it("displays the name of the artist of the selected art piece", () => {
    mockRandom(0.999);

    render(<Spotlight artPieces={artPieces} />);

    expect(screen.getByText("Vincent van Gogh")).toBeInTheDocument();
  });

  it("keeps the same art piece when it renders again", () => {
    mockRandom(0);
    const { rerender } = render(<Spotlight artPieces={artPieces} />);

    mockRandom(0.999);
    rerender(<Spotlight artPieces={artPieces} />);

    expect(screen.getByText("Pieter Bruegel the Elder")).toBeInTheDocument();
    expect(screen.queryByText("Vincent van Gogh")).not.toBeInTheDocument();
  });

  it("renders nothing when there are no art pieces", () => {
    const { container } = render(<Spotlight artPieces={[]} />);

    expect(container).toBeEmptyDOMElement();
  });
});
