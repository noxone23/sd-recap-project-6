import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { SWRConfig } from "swr";

import App from "./App";
import type { ArtPiece } from "./types";

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
];

function renderApp(path: string) {
  return render(
    <SWRConfig value={{ provider: () => new Map() }}>
      <MemoryRouter initialEntries={[path]}>
        <App />
      </MemoryRouter>
    </SWRConfig>
  );
}

function mockRandom(fraction: number) {
  return vi.spyOn(crypto, "getRandomValues").mockImplementation((array) => {
    (array as Uint32Array)[0] = Math.floor(fraction * 2 ** 32);
    return array;
  });
}

function mockArtPieces() {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({ ok: true, json: async () => artPieces })
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("App", () => {
  it("shows the art pieces on the route /art-pieces", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => artPieces })
    );

    renderApp("/art-pieces");

    expect(await screen.findByText("The Harvesters")).toBeInTheDocument();
    expect(screen.getByText("Vincent van Gogh")).toBeInTheDocument();
    expect(screen.getAllByRole("img")).toHaveLength(2);
  });

  it("shows the spotlight on the route /", async () => {
    mockRandom(0.999);
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => artPieces })
    );

    renderApp("/");

    expect(await screen.findByText("Vincent van Gogh")).toBeInTheDocument();
    expect(screen.getAllByRole("img")).toHaveLength(1);
    expect(
      screen.getByRole("img", { name: "Wheat Field with Cypresses" })
    ).toBeInTheDocument();
  });

  it("shows a loading message while the art pieces are loading", () => {
    vi.stubGlobal("fetch", vi.fn().mockReturnValue(new Promise(() => {})));

    renderApp("/art-pieces");

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("shows an error message when loading the art pieces fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 500 })
    );

    renderApp("/art-pieces");

    expect(
      await screen.findByText("Failed to load art pieces.")
    ).toBeInTheDocument();
  });

  it("shows the spotlight after clicking Spotlight", async () => {
    mockRandom(0.999);
    mockArtPieces();
    const user = userEvent.setup();
    renderApp("/art-pieces");

    await user.click(await screen.findByRole("link", { name: "Spotlight" }));

    expect(screen.getAllByRole("img")).toHaveLength(1);
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });

  it("shows the gallery after clicking Gallery", async () => {
    mockArtPieces();
    const user = userEvent.setup();
    renderApp("/");

    await user.click(await screen.findByRole("link", { name: "Gallery" }));

    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(screen.getAllByRole("img")).toHaveLength(2);
  });

  it("shows Page not found for an unknown URL", async () => {
    mockArtPieces();

    renderApp("/does-not-exist");

    expect(await screen.findByText("Page not found")).toBeInTheDocument();
  });

  it("shows the details on the route /art-pieces/:slug", async () => {
    mockArtPieces();

    renderApp("/art-pieces/the-harvesters");

    expect(
      await screen.findByRole("heading", { name: "The Harvesters" })
    ).toBeInTheDocument();
    expect(screen.getByText("Pieter Bruegel the Elder")).toBeInTheDocument();
    expect(screen.getByText("1565")).toBeInTheDocument();
    expect(screen.getByText("Renaissance")).toBeInTheDocument();
    expect(screen.getAllByRole("img")).toHaveLength(1);
  });

  it("shows the details after clicking an art piece in the list", async () => {
    mockArtPieces();
    const user = userEvent.setup();
    renderApp("/art-pieces");

    await user.click(
      await screen.findByRole("link", { name: /Wheat Field with Cypresses/ })
    );

    expect(screen.getByText("1889")).toBeInTheDocument();
    expect(screen.getByText("Post-Impressionism")).toBeInTheDocument();
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });

  it("shows the list after clicking Back on the details page", async () => {
    mockArtPieces();
    const user = userEvent.setup();
    renderApp("/art-pieces/the-harvesters");

    await user.click(await screen.findByRole("link", { name: "Back" }));

    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });

  it("shows Art piece not found for an unknown slug", async () => {
    mockArtPieces();

    renderApp("/art-pieces/unknown");

    expect(await screen.findByText("Art piece not found")).toBeInTheDocument();
  });

  it("marks an art piece as favorite after clicking its favorite button", async () => {
    mockArtPieces();
    const user = userEvent.setup();
    renderApp("/art-pieces");

    const button = await screen.findByRole("button", {
      name: "Favorite The Harvesters",
    });
    expect(button).toHaveAttribute("aria-pressed", "false");

    await user.click(button);

    expect(button).toHaveAttribute("aria-pressed", "true");
    expect(
      screen.getByRole("button", {
        name: "Favorite Wheat Field with Cypresses",
      })
    ).toHaveAttribute("aria-pressed", "false");
  });

  it("removes the favorite after clicking the favorite button again", async () => {
    mockArtPieces();
    const user = userEvent.setup();
    renderApp("/art-pieces");

    const button = await screen.findByRole("button", {
      name: "Favorite The Harvesters",
    });
    await user.click(button);
    await user.click(button);

    expect(button).toHaveAttribute("aria-pressed", "false");
  });

  it("keeps the favorite status when navigating to the details page", async () => {
    mockArtPieces();
    const user = userEvent.setup();
    renderApp("/art-pieces");

    await user.click(
      await screen.findByRole("button", { name: "Favorite The Harvesters" })
    );
    await user.click(screen.getByRole("link", { name: /The Harvesters/ }));

    expect(
      screen.getByRole("button", { name: "Favorite The Harvesters" })
    ).toHaveAttribute("aria-pressed", "true");
  });

  it("toggles the favorite on the spotlight", async () => {
    mockRandom(0);
    mockArtPieces();
    const user = userEvent.setup();
    renderApp("/");

    const button = await screen.findByRole("button", {
      name: "Favorite The Harvesters",
    });
    expect(button).toHaveAttribute("aria-pressed", "false");

    await user.click(button);
    expect(button).toHaveAttribute("aria-pressed", "true");

    await user.click(button);
    expect(button).toHaveAttribute("aria-pressed", "false");
  });

  it("toggles the favorite on the details page", async () => {
    mockArtPieces();
    const user = userEvent.setup();
    renderApp("/art-pieces/the-harvesters");

    const button = await screen.findByRole("button", {
      name: "Favorite The Harvesters",
    });
    expect(button).toHaveAttribute("aria-pressed", "false");

    await user.click(button);
    expect(button).toHaveAttribute("aria-pressed", "true");

    await user.click(button);
    expect(button).toHaveAttribute("aria-pressed", "false");
  });

  it("keeps the favorite status when navigating to the spotlight", async () => {
    mockRandom(0);
    mockArtPieces();
    const user = userEvent.setup();
    renderApp("/art-pieces");

    await user.click(
      await screen.findByRole("button", { name: "Favorite The Harvesters" })
    );
    await user.click(screen.getByRole("link", { name: "Spotlight" }));

    expect(
      screen.getByRole("button", { name: "Favorite The Harvesters" })
    ).toHaveAttribute("aria-pressed", "true");
  });

  it.each(["/", "/art-pieces", "/does-not-exist"])(
    "renders the navigation exactly once on %s",
    async (path) => {
      mockArtPieces();

      renderApp(path);

      await screen.findByRole("heading", { name: "Art Gallery" });
      expect(screen.getAllByRole("navigation")).toHaveLength(1);
    }
  );

  it("shows the navigation while the art pieces are loading", () => {
    vi.stubGlobal("fetch", vi.fn().mockReturnValue(new Promise(() => {})));

    renderApp("/art-pieces");

    expect(screen.getByRole("navigation")).toBeInTheDocument();
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("shows the navigation when loading the art pieces fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 500 })
    );

    renderApp("/art-pieces");

    expect(
      await screen.findByText("Failed to load art pieces.")
    ).toBeInTheDocument();
    expect(screen.getByRole("navigation")).toBeInTheDocument();
  });
});
