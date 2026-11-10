import { render, screen, within } from "@testing-library/react";
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
    colors: ["#37412E", "#8D7332"],
  },
  {
    slug: "wheat-field-with-cypresses",
    name: "Wheat Field with Cypresses",
    artist: "Vincent van Gogh",
    imageSource: "https://example.com/wheat-field-with-cypresses.jpg",
    year: "1889",
    genre: "Post-Impressionism",
    colors: ["#112233", "#445566", "#778899"],
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
  localStorage.clear();
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

  it("shows the favorites page after clicking Favorites", async () => {
    mockArtPieces();
    const user = userEvent.setup();
    renderApp("/");

    await user.click(await screen.findByRole("link", { name: "Favorites" }));

    expect(screen.getByText("No favorites yet.")).toBeInTheDocument();
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });

  it("lists only the favorite art pieces on the favorites page", async () => {
    mockArtPieces();
    const user = userEvent.setup();
    renderApp("/art-pieces");

    await user.click(
      await screen.findByRole("button", {
        name: "Favorite Wheat Field with Cypresses",
      })
    );
    await user.click(screen.getByRole("link", { name: "Favorites" }));

    expect(screen.getAllByRole("listitem")).toHaveLength(1);
    expect(
      screen.getByRole("img", { name: "Wheat Field with Cypresses" })
    ).toBeInTheDocument();
    expect(screen.getByText("Wheat Field with Cypresses")).toBeInTheDocument();
    expect(screen.getByText("Vincent van Gogh")).toBeInTheDocument();
    expect(screen.queryByText("The Harvesters")).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: "Favorite Wheat Field with Cypresses",
      })
    ).toHaveAttribute("aria-pressed", "true");
    expect(screen.queryByText("No favorites yet.")).not.toBeInTheDocument();
  });

  it("removes an art piece from the favorites page after clicking its favorite button", async () => {
    mockArtPieces();
    const user = userEvent.setup();
    renderApp("/art-pieces");

    await user.click(
      await screen.findByRole("button", { name: "Favorite The Harvesters" })
    );
    await user.click(screen.getByRole("link", { name: "Favorites" }));
    await user.click(
      screen.getByRole("button", { name: "Favorite The Harvesters" })
    );

    expect(screen.queryByText("The Harvesters")).not.toBeInTheDocument();
    expect(screen.getByText("No favorites yet.")).toBeInTheDocument();
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

  it("shows the color palette of the art piece on the details page", async () => {
    mockArtPieces();

    renderApp("/art-pieces/wheat-field-with-cypresses");

    const palette = await screen.findByRole("list", { name: "Color palette" });
    const items = within(palette).getAllByRole("listitem");
    expect(items).toHaveLength(3);
    expect(items[0]).toHaveStyle({ backgroundColor: "#112233" });
    expect(items[1]).toHaveStyle({ backgroundColor: "#445566" });
    expect(items[2]).toHaveStyle({ backgroundColor: "#778899" });
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
    expect(screen.queryByText("The Harvesters")).not.toBeInTheDocument();
  });

  it("shows the list after clicking Back on the details page", async () => {
    mockArtPieces();
    const user = userEvent.setup();
    renderApp("/art-pieces/the-harvesters");

    await user.click(await screen.findByRole("link", { name: "Back" }));

    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });

  it("adds a comment to the art piece on the details page", async () => {
    mockArtPieces();
    const user = userEvent.setup();
    renderApp("/art-pieces/the-harvesters");

    await user.type(
      await screen.findByRole("textbox", { name: "Comment" }),
      "Beautiful colors"
    );
    await user.click(screen.getByRole("button", { name: "Add comment" }));

    const comments = screen.getByRole("region", { name: "Comments" });
    expect(within(comments).getAllByRole("listitem")).toHaveLength(1);
    expect(within(comments).getByText("Beautiful colors")).toBeInTheDocument();
    expect(comments.querySelector("time")).toBeInTheDocument();
  });

  it("adds a comment only to its own art piece", async () => {
    mockArtPieces();
    const user = userEvent.setup();
    renderApp("/art-pieces/the-harvesters");

    await user.type(
      await screen.findByRole("textbox", { name: "Comment" }),
      "Beautiful colors"
    );
    await user.click(screen.getByRole("button", { name: "Add comment" }));
    await user.click(screen.getByRole("link", { name: "Back" }));
    await user.click(
      screen.getByRole("link", { name: /Wheat Field with Cypresses/ })
    );

    expect(screen.queryByText("Beautiful colors")).not.toBeInTheDocument();

    await user.click(screen.getByRole("link", { name: "Back" }));
    await user.click(screen.getByRole("link", { name: /The Harvesters/ }));

    expect(screen.getByText("Beautiful colors")).toBeInTheDocument();
  });

  it("keeps the favorite status and the comments of an art piece together", async () => {
    mockArtPieces();
    const user = userEvent.setup();
    renderApp("/art-pieces/the-harvesters");

    await user.click(
      await screen.findByRole("button", { name: "Favorite The Harvesters" })
    );
    await user.type(
      screen.getByRole("textbox", { name: "Comment" }),
      "Beautiful colors"
    );
    await user.click(screen.getByRole("button", { name: "Add comment" }));

    expect(screen.getByText("Beautiful colors")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Favorite The Harvesters" })
    ).toHaveAttribute("aria-pressed", "true");

    await user.click(
      screen.getByRole("button", { name: "Favorite The Harvesters" })
    );

    expect(screen.getByText("Beautiful colors")).toBeInTheDocument();
  });

  it("does not add an empty comment", async () => {
    mockArtPieces();
    const user = userEvent.setup();
    renderApp("/art-pieces/the-harvesters");

    await user.type(
      await screen.findByRole("textbox", { name: "Comment" }),
      "   "
    );
    await user.click(screen.getByRole("button", { name: "Add comment" }));

    expect(
      within(screen.getByRole("region", { name: "Comments" })).queryAllByRole(
        "listitem"
      )
    ).toHaveLength(0);
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

  it("keeps the favorites after the app is reloaded", async () => {
    mockArtPieces();
    const user = userEvent.setup();
    const { unmount } = renderApp("/art-pieces");

    await user.click(
      await screen.findByRole("button", { name: "Favorite The Harvesters" })
    );
    unmount();
    renderApp("/art-pieces");

    expect(
      await screen.findByRole("button", { name: "Favorite The Harvesters" })
    ).toHaveAttribute("aria-pressed", "true");
    expect(
      screen.getByRole("button", {
        name: "Favorite Wheat Field with Cypresses",
      })
    ).toHaveAttribute("aria-pressed", "false");

    await user.click(screen.getByRole("link", { name: "Favorites" }));

    expect(screen.getAllByRole("listitem")).toHaveLength(1);
    expect(screen.getByText("The Harvesters")).toBeInTheDocument();
  });

  it("keeps the comments after the app is reloaded", async () => {
    mockArtPieces();
    const user = userEvent.setup();
    const { unmount } = renderApp("/art-pieces/the-harvesters");

    await user.type(
      await screen.findByRole("textbox", { name: "Comment" }),
      "Beautiful colors"
    );
    await user.click(screen.getByRole("button", { name: "Add comment" }));
    unmount();
    renderApp("/art-pieces/the-harvesters");

    const comments = await screen.findByRole("region", { name: "Comments" });
    expect(within(comments).getAllByRole("listitem")).toHaveLength(1);
    expect(within(comments).getByText("Beautiful colors")).toBeInTheDocument();
  });

  it("keeps a removed favorite removed after the app is reloaded", async () => {
    mockArtPieces();
    const user = userEvent.setup();
    const { unmount } = renderApp("/art-pieces");

    const button = await screen.findByRole("button", {
      name: "Favorite The Harvesters",
    });
    await user.click(button);
    await user.click(button);
    unmount();
    renderApp("/favorites");

    expect(await screen.findByText("No favorites yet.")).toBeInTheDocument();
  });

  it("shows the gallery without any favorite when nothing is saved", async () => {
    mockArtPieces();
    expect(localStorage.length).toBe(0);

    renderApp("/art-pieces");

    const buttons = await screen.findAllByRole("button", { name: /Favorite/ });
    expect(buttons).toHaveLength(2);
    buttons.forEach((button) =>
      expect(button).toHaveAttribute("aria-pressed", "false")
    );
  });

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

  it("shows a search field on the route /art-pieces", async () => {
    mockArtPieces();

    renderApp("/art-pieces");

    expect(
      await screen.findByRole("searchbox", { name: "Search" })
    ).toBeInTheDocument();
  });

  it("shows only the art pieces that match the search on the route /art-pieces", async () => {
    mockArtPieces();
    const user = userEvent.setup();
    renderApp("/art-pieces");

    await user.type(
      await screen.findByRole("searchbox", { name: "Search" }),
      "van gogh"
    );

    expect(screen.getAllByRole("listitem")).toHaveLength(1);
    expect(screen.getByText("Wheat Field with Cypresses")).toBeInTheDocument();
    expect(screen.queryByText("The Harvesters")).not.toBeInTheDocument();
  });

  it("shows a message when no art piece matches the search", async () => {
    mockArtPieces();
    const user = userEvent.setup();
    renderApp("/art-pieces");

    await user.type(
      await screen.findByRole("searchbox", { name: "Search" }),
      "monet"
    );

    expect(screen.getByText("No art pieces found")).toBeInTheDocument();
  });

  it("keeps the favorite button of a found art piece working", async () => {
    mockArtPieces();
    const user = userEvent.setup();
    renderApp("/art-pieces");

    await user.type(
      await screen.findByRole("searchbox", { name: "Search" }),
      "wheat"
    );
    await user.click(
      screen.getByRole("button", {
        name: "Favorite Wheat Field with Cypresses",
      })
    );
    await user.click(screen.getByRole("link", { name: "Favorites" }));

    expect(screen.getAllByRole("listitem")).toHaveLength(1);
    expect(screen.getByText("Wheat Field with Cypresses")).toBeInTheDocument();
  });

  it.each([["/"], ["/favorites"]])(
    "shows no search field on the route %s",
    async (path) => {
      mockRandom(0.999);
      mockArtPieces();

      renderApp(path);

      expect(await screen.findByRole("navigation")).toBeInTheDocument();
      expect(
        screen.queryByRole("searchbox", { name: "Search" })
      ).not.toBeInTheDocument();
    }
  );
});
