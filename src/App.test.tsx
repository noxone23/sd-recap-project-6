import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, useLocation, useNavigate } from "react-router";
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

function LocationDisplay() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <>
      <span data-testid="path">{location.pathname}</span>
      <span data-testid="query">
        {new URLSearchParams(location.search).get("q") ?? ""}
      </span>
      <span data-testid="search">{location.search}</span>
      <button type="button" onClick={() => navigate(-1)}>
        Go back
      </button>
    </>
  );
}

function renderAppWithLocation(path: string) {
  return render(
    <SWRConfig value={{ provider: () => new Map() }}>
      <MemoryRouter initialEntries={[path]}>
        <App />
        <LocationDisplay />
      </MemoryRouter>
    </SWRConfig>
  );
}

function getSearchField() {
  return screen.getByRole("searchbox", { name: "Search" });
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
    expect(within(screen.getByRole("main")).getAllByRole("img")).toHaveLength(
      2
    );
  });

  it("shows the spotlight on the route /", async () => {
    mockRandom(0.999);
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => artPieces })
    );

    renderApp("/");

    expect(await screen.findByText("Vincent van Gogh")).toBeInTheDocument();
    expect(within(screen.getByRole("main")).getAllByRole("img")).toHaveLength(
      1
    );
    expect(
      screen.getByRole("img", { name: "Wheat Field with Cypresses" })
    ).toBeInTheDocument();
  });

  it("shows the details after clicking the image on the spotlight", async () => {
    mockRandom(0.999);
    mockArtPieces();
    const user = userEvent.setup();
    renderApp("/");

    await user.click(
      await screen.findByRole("link", { name: "Wheat Field with Cypresses" })
    );

    expect(screen.getByText("1889")).toBeInTheDocument();
    expect(screen.getByText("Post-Impressionism")).toBeInTheDocument();
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

    expect(within(screen.getByRole("main")).getAllByRole("img")).toHaveLength(
      1
    );
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });

  it("shows the gallery after clicking Gallery", async () => {
    mockArtPieces();
    const user = userEvent.setup();
    renderApp("/");

    await user.click(await screen.findByRole("link", { name: "Gallery" }));

    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(within(screen.getByRole("main")).getAllByRole("img")).toHaveLength(
      2
    );
  });

  it("shows the spotlight after clicking the page title", async () => {
    mockRandom(0.999);
    mockArtPieces();
    const user = userEvent.setup();
    renderApp("/art-pieces");
    await screen.findAllByRole("listitem");

    await user.click(
      within(screen.getByRole("heading", { name: "Art Gallery" })).getByRole(
        "link",
        { name: "Art Gallery" }
      )
    );

    expect(within(screen.getByRole("main")).getAllByRole("img")).toHaveLength(
      1
    );
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });

  it("keeps the link of the page title out of the tab order", () => {
    vi.stubGlobal("fetch", vi.fn().mockReturnValue(new Promise(() => {})));

    renderApp("/art-pieces");

    expect(screen.getByRole("link", { name: "Art Gallery" })).toHaveAttribute(
      "tabindex",
      "-1"
    );
    expect(screen.getByRole("link", { name: "Art Gallery" })).toHaveAttribute(
      "href",
      "/"
    );
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
    expect(within(screen.getByRole("main")).getAllByRole("img")).toHaveLength(
      1
    );
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

  it("shows the favorites after clicking Back on the details page opened from the favorites", async () => {
    localStorage.setItem(
      "art-pieces-info",
      JSON.stringify([
        { slug: "wheat-field-with-cypresses", isFavorite: true, comments: [] },
      ])
    );
    mockArtPieces();
    const user = userEvent.setup();
    renderApp("/favorites");

    await user.click(
      await screen.findByRole("link", { name: /Wheat Field with Cypresses/ })
    );
    await user.click(screen.getByRole("link", { name: "Back" }));

    expect(screen.getAllByRole("listitem")).toHaveLength(1);
    expect(screen.getByText("Wheat Field with Cypresses")).toBeInTheDocument();
    expect(screen.queryByText("The Harvesters")).not.toBeInTheDocument();
  });

  it("keeps the search after clicking Back on the details page opened from the gallery", async () => {
    mockArtPieces();
    const user = userEvent.setup();
    renderApp("/art-pieces?q=gogh");

    await user.click(
      await screen.findByRole("link", { name: /Wheat Field with Cypresses/ })
    );
    await user.click(screen.getByRole("link", { name: "Back" }));

    expect(screen.getAllByRole("listitem")).toHaveLength(1);
    expect(screen.getByRole("searchbox", { name: "Search" })).toHaveValue(
      "gogh"
    );
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

  it.each(["/does-not-exist", "/art-pieces/unknown"])(
    "links back to the gallery from the not found message on %s",
    async (path) => {
      mockArtPieces();
      const user = userEvent.setup();
      renderApp(path);

      await user.click(
        await screen.findByRole("link", { name: "Back to gallery" })
      );

      expect(screen.getAllByRole("listitem")).toHaveLength(2);
    }
  );

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
    expect(screen.queryByText("The Harvesters")).not.toBeInTheDocument();
  });
});

describe("App page title", () => {
  it.each([
    ["/", "Art Gallery"],
    ["/art-pieces", "Gallery – Art Gallery"],
    ["/favorites", "Favorites – Art Gallery"],
    ["/art-pieces/the-harvesters", "The Harvesters – Art Gallery"],
    ["/art-pieces/unknown", "Art piece not found – Art Gallery"],
    ["/does-not-exist", "Page not found – Art Gallery"],
  ])("sets the document title on the route %s", async (path, title) => {
    mockArtPieces();

    renderApp(path);

    await waitFor(() => expect(document.title).toBe(title));
  });

  it("keeps the app name as title while the art pieces are loading", () => {
    vi.stubGlobal("fetch", vi.fn().mockReturnValue(new Promise(() => {})));

    renderApp("/art-pieces/the-harvesters");

    expect(document.title).toBe("Art Gallery");
  });

  it("keeps the app name as title when loading the art pieces fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 500 })
    );

    renderApp("/art-pieces/the-harvesters");

    await screen.findByText("Failed to load art pieces.");
    expect(document.title).toBe("Art Gallery");
  });

  it("changes the document title when navigating to another page", async () => {
    mockArtPieces();
    const user = userEvent.setup();
    renderApp("/art-pieces");

    await user.click(await screen.findByRole("link", { name: "Favorites" }));

    expect(document.title).toBe("Favorites – Art Gallery");
  });

  it("restores the previous document title when the app is removed", () => {
    document.title = "Before";
    vi.stubGlobal("fetch", vi.fn().mockReturnValue(new Promise(() => {})));
    const { unmount } = renderApp("/art-pieces");

    unmount();

    expect(document.title).toBe("Before");
  });
});

describe("App theme", () => {
  function mockSystemTheme(prefersDark: boolean) {
    vi.stubGlobal(
      "matchMedia",
      vi.fn().mockReturnValue({ matches: prefersDark })
    );
  }

  function renderLoadingApp() {
    vi.stubGlobal("fetch", vi.fn().mockReturnValue(new Promise(() => {})));
    return renderApp("/art-pieces");
  }

  afterEach(() => {
    delete document.documentElement.dataset.theme;
  });

  it("shows the theme toggle in the header", () => {
    renderLoadingApp();

    expect(
      within(screen.getByRole("banner")).getByRole("button", {
        name: "Switch to dark mode",
      })
    ).toBeInTheDocument();
  });

  it("switches the theme and the label when the toggle is clicked", async () => {
    const user = userEvent.setup();
    renderLoadingApp();
    expect(document.documentElement).toHaveAttribute("data-theme", "light");

    await user.click(
      screen.getByRole("button", { name: "Switch to dark mode" })
    );

    expect(document.documentElement).toHaveAttribute("data-theme", "dark");
    expect(
      screen.getByRole("button", { name: "Switch to light mode" })
    ).toBeInTheDocument();
  });

  it("starts with the dark theme when the system setting is dark", () => {
    mockSystemTheme(true);

    renderLoadingApp();

    expect(document.documentElement).toHaveAttribute("data-theme", "dark");
    expect(
      screen.getByRole("button", { name: "Switch to light mode" })
    ).toBeInTheDocument();
  });

  it("prefers the saved choice to the system setting", () => {
    mockSystemTheme(false);
    localStorage.setItem("theme", "dark");

    renderLoadingApp();

    expect(document.documentElement).toHaveAttribute("data-theme", "dark");
  });

  it("saves the choice when the toggle is clicked", async () => {
    const user = userEvent.setup();
    renderLoadingApp();

    await user.click(
      screen.getByRole("button", { name: "Switch to dark mode" })
    );

    expect(localStorage.getItem("theme")).toBe("dark");
  });

  it("saves nothing as long as the toggle is not used", () => {
    mockSystemTheme(true);

    renderLoadingApp();

    expect(localStorage.getItem("theme")).toBeNull();
  });

  it("keeps working when the local storage is blocked", async () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new DOMException("Access denied", "SecurityError");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("Quota exceeded", "QuotaExceededError");
    });
    const user = userEvent.setup();
    renderLoadingApp();

    await user.click(
      screen.getByRole("button", { name: "Switch to dark mode" })
    );

    expect(document.documentElement).toHaveAttribute("data-theme", "dark");
  });

  it("does not change the saved favorites and comments", async () => {
    const saved = JSON.stringify([
      {
        slug: "the-harvesters",
        isFavorite: true,
        comments: [
          { text: "Beautiful colors", date: "2026-11-09T10:15:00.000Z" },
        ],
      },
    ]);
    localStorage.setItem("art-pieces-info", saved);
    const user = userEvent.setup();
    renderLoadingApp();

    await user.click(
      screen.getByRole("button", { name: "Switch to dark mode" })
    );

    expect(localStorage.getItem("art-pieces-info")).toBe(saved);
  });
});

describe("App search in the header", () => {
  it.each([
    ["/"],
    ["/art-pieces"],
    ["/favorites"],
    ["/art-pieces/the-harvesters"],
    ["/does-not-exist"],
  ])("shows the search field in the header on the route %s", (path) => {
    vi.stubGlobal("fetch", vi.fn().mockReturnValue(new Promise(() => {})));

    renderApp(path);

    expect(
      within(screen.getByRole("banner")).getByRole("searchbox", {
        name: "Search",
      })
    ).toBeInTheDocument();
  });

  it("shows the search field in the header when loading fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 500 })
    );

    renderApp("/art-pieces");

    expect(
      await screen.findByText("Failed to load art pieces.")
    ).toBeInTheDocument();
    expect(
      within(screen.getByRole("banner")).getByRole("searchbox", {
        name: "Search",
      })
    ).toBeInTheDocument();
  });

  it("has only one search field on the Gallery page", async () => {
    mockArtPieces();

    renderApp("/art-pieces");

    expect(await screen.findAllByRole("listitem")).toHaveLength(2);
    expect(screen.getAllByRole("searchbox")).toHaveLength(1);
  });

  it("opens the Gallery with the matching art pieces when typing on another page", async () => {
    mockRandom(0.999);
    mockArtPieces();
    const user = userEvent.setup();
    renderAppWithLocation("/");
    await screen.findByRole("img", { name: "Wheat Field with Cypresses" });

    await user.type(getSearchField(), "van gogh");

    expect(screen.getByTestId("path")).toHaveTextContent("/art-pieces");
    expect(screen.getByTestId("query")).toHaveTextContent("van gogh");
    expect(screen.getAllByRole("listitem")).toHaveLength(1);
    expect(getSearchField()).toHaveValue("van gogh");
  });

  it("keeps the Gallery page when typing in the Gallery", async () => {
    mockArtPieces();
    const user = userEvent.setup();
    renderAppWithLocation("/art-pieces");
    await screen.findAllByRole("listitem");

    await user.type(getSearchField(), "gogh");

    expect(screen.getByTestId("path")).toHaveTextContent("/art-pieces");
    expect(screen.getByTestId("query")).toHaveTextContent("gogh");
    expect(screen.getAllByRole("listitem")).toHaveLength(1);
  });

  it("shows the field filled and the filtered list when the address has a search text", async () => {
    mockArtPieces();

    renderApp("/art-pieces?q=gogh");

    expect(await screen.findAllByRole("listitem")).toHaveLength(1);
    expect(getSearchField()).toHaveValue("gogh");
  });

  it("leads back to the page where the search started", async () => {
    mockRandom(0.999);
    mockArtPieces();
    const user = userEvent.setup();
    renderAppWithLocation("/");
    await screen.findByRole("img", { name: "Wheat Field with Cypresses" });
    await user.type(getSearchField(), "wheat");

    await user.click(screen.getByRole("button", { name: "Go back" }));

    expect(screen.getByTestId("path")).toHaveTextContent("/");
    expect(getSearchField()).toHaveValue("");
  });

  it("adds no history entry for each letter typed in the Gallery", async () => {
    mockRandom(0.999);
    mockArtPieces();
    const user = userEvent.setup();
    renderAppWithLocation("/");
    await screen.findByRole("img", { name: "Wheat Field with Cypresses" });
    await user.click(screen.getByRole("link", { name: "Gallery" }));
    await screen.findAllByRole("listitem");
    await user.type(getSearchField(), "wheat");

    await user.click(screen.getByRole("button", { name: "Go back" }));

    expect(screen.getByTestId("path")).toHaveTextContent("/");
  });

  it("shows all art pieces and stays in the Gallery when the field is cleared", async () => {
    mockArtPieces();
    const user = userEvent.setup();
    renderAppWithLocation("/art-pieces?q=gogh");
    await screen.findAllByRole("listitem");

    await user.clear(getSearchField());

    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(screen.getByTestId("path")).toHaveTextContent("/art-pieces");
    expect(screen.getByTestId("search")).toBeEmptyDOMElement();
  });

  it("empties the field when a navigation link is used", async () => {
    mockArtPieces();
    const user = userEvent.setup();
    renderApp("/art-pieces?q=gogh");
    await screen.findAllByRole("listitem");

    await user.click(screen.getByRole("link", { name: "Gallery" }));

    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(getSearchField()).toHaveValue("");
  });

  it("does not filter the Favorites page by the search text of the address", async () => {
    localStorage.setItem(
      "art-pieces-info",
      JSON.stringify([
        { slug: "wheat-field-with-cypresses", isFavorite: true, comments: [] },
      ])
    );
    mockArtPieces();

    renderApp("/favorites?q=zzz");

    expect(await screen.findAllByRole("listitem")).toHaveLength(1);
    expect(getSearchField()).toHaveValue("");
  });

  it("filters by the search text when the Gallery address has a slash at the end", async () => {
    mockArtPieces();

    renderApp("/art-pieces/?q=gogh");

    expect(await screen.findAllByRole("listitem")).toHaveLength(1);
    expect(getSearchField()).toHaveValue("gogh");
  });

  it("keeps special characters of the search text in the address", async () => {
    mockArtPieces();
    const user = userEvent.setup();
    renderAppWithLocation("/art-pieces");
    await screen.findAllByRole("listitem");

    await user.type(getSearchField(), "a&b+c%d#e");

    expect(screen.getByTestId("search")).toHaveTextContent(
      "?q=a%26b%2Bc%25d%23e"
    );
    expect(getSearchField()).toHaveValue("a&b+c%d#e");
    expect(screen.getByRole("status")).toHaveTextContent("No art pieces found");
  });

  it("shows all art pieces when the search text is only spaces", async () => {
    mockArtPieces();
    const user = userEvent.setup();
    renderApp("/art-pieces");
    await screen.findAllByRole("listitem");

    await user.type(getSearchField(), "   ");

    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });

  it("puts the search field first, then the theme toggle, then the navigation links", async () => {
    vi.stubGlobal("fetch", vi.fn().mockReturnValue(new Promise(() => {})));
    const user = userEvent.setup();
    renderApp("/");

    await user.tab();
    expect(getSearchField()).toHaveFocus();
    await user.tab();
    expect(
      screen.getByRole("button", { name: "Switch to dark mode" })
    ).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("link", { name: "Spotlight" })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("link", { name: "Gallery" })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("link", { name: "Favorites" })).toHaveFocus();
  });
});

describe("App back to top", () => {
  const scrollToMock = vi.fn();
  const originalScrollY = Object.getOwnPropertyDescriptor(window, "scrollY");

  function scrollTo(position: number) {
    Object.defineProperty(window, "scrollY", {
      configurable: true,
      value: position,
    });
    fireEvent.scroll(window);
  }

  function renderLoadingApp(path: string) {
    vi.stubGlobal("fetch", vi.fn().mockReturnValue(new Promise(() => {})));
    return renderApp(path);
  }

  beforeEach(() => {
    scrollToMock.mockClear();
    vi.stubGlobal("scrollTo", scrollToMock);
  });

  afterEach(() => {
    if (originalScrollY) {
      Object.defineProperty(window, "scrollY", originalScrollY);
    } else {
      Reflect.deleteProperty(window, "scrollY");
    }
  });

  it("shows no back to top button at the start", () => {
    renderLoadingApp("/art-pieces");

    expect(
      screen.queryByRole("button", { name: "Back to top" })
    ).not.toBeInTheDocument();
  });

  it.each([
    ["/"],
    ["/art-pieces"],
    ["/favorites"],
    ["/art-pieces/the-harvesters"],
    ["/does-not-exist"],
  ])("shows the back to top button after scrolling on the route %s", (path) => {
    renderLoadingApp(path);

    scrollTo(500);

    expect(
      screen.getByRole("button", { name: "Back to top" })
    ).toBeInTheDocument();
  });

  it("scrolls to the top when the button is clicked", async () => {
    const user = userEvent.setup();
    renderLoadingApp("/art-pieces");
    scrollTo(500);

    await user.click(screen.getByRole("button", { name: "Back to top" }));

    expect(scrollToMock).toHaveBeenCalledWith({ top: 0 });
  });

  it("moves the focus to the page title when the button is clicked", async () => {
    const user = userEvent.setup();
    renderLoadingApp("/art-pieces");
    scrollTo(500);

    await user.click(screen.getByRole("button", { name: "Back to top" }));

    expect(screen.getByRole("heading", { name: "Art Gallery" })).toHaveFocus();
  });

  it("keeps the page title out of the tab order", () => {
    renderLoadingApp("/art-pieces");

    expect(
      screen.getByRole("heading", { name: "Art Gallery" })
    ).toHaveAttribute("tabindex", "-1");
  });
});

describe("App mouse trail", () => {
  function mockMedia({ reduce = false } = {}) {
    vi.stubGlobal(
      "matchMedia",
      vi.fn((query: string) => ({
        matches: query.includes("prefers-reduced-motion") ? reduce : true,
      }))
    );
  }

  function renderLoadingApp(path: string) {
    vi.stubGlobal("fetch", vi.fn().mockReturnValue(new Promise(() => {})));
    return render(
      <SWRConfig value={{ provider: () => new Map() }}>
        <MemoryRouter initialEntries={[path]}>
          <App />
        </MemoryRouter>
      </SWRConfig>
    );
  }

  beforeEach(() => {
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
  });

  it("shows no canvas when the browser has no matchMedia", () => {
    const { container } = renderLoadingApp("/art-pieces");

    expect(container.querySelector("canvas")).toBeNull();
  });

  it("shows no canvas when the user asks for reduced motion", () => {
    mockMedia({ reduce: true });

    const { container } = renderLoadingApp("/art-pieces");

    expect(container.querySelector("canvas")).toBeNull();
  });

  it.each([
    ["/"],
    ["/art-pieces"],
    ["/favorites"],
    ["/art-pieces/the-harvesters"],
    ["/does-not-exist"],
  ])("shows exactly one hidden canvas on the route %s", (path) => {
    mockMedia();

    const { container } = renderLoadingApp(path);

    const canvases = container.querySelectorAll("canvas");
    expect(canvases).toHaveLength(1);
    expect(canvases[0]).toHaveAttribute("inert");
  });
});

describe("App genre filter in the Gallery", () => {
  async function findGenreControl() {
    return screen.findByRole("combobox", { name: "Genre" });
  }

  it("shows the genre control in the Gallery and not in the header", async () => {
    mockArtPieces();

    renderApp("/art-pieces");

    const control = await findGenreControl();
    expect(
      within(screen.getByRole("main")).getByRole("combobox", { name: "Genre" })
    ).toBe(control);
    expect(
      within(screen.getByRole("banner")).queryByRole("combobox")
    ).not.toBeInTheDocument();
  });

  it("offers All genres and the genres of the art pieces", async () => {
    mockArtPieces();

    renderApp("/art-pieces");

    await findGenreControl();
    expect(
      screen.getAllByRole("option").map((option) => option.textContent)
    ).toEqual(["All genres", "Post-Impressionism", "Renaissance"]);
  });

  it("starts with All genres and shows all art pieces", async () => {
    mockArtPieces();

    renderApp("/art-pieces");

    expect(await findGenreControl()).toHaveValue("");
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });

  it("shows only the art pieces of the selected genre and puts it in the address", async () => {
    mockArtPieces();
    const user = userEvent.setup();
    renderAppWithLocation("/art-pieces");

    await user.selectOptions(await findGenreControl(), "Renaissance");

    expect(screen.getAllByRole("listitem")).toHaveLength(1);
    expect(screen.getByText("The Harvesters")).toBeInTheDocument();
    expect(screen.getByTestId("search")).toHaveTextContent(
      "?genre=Renaissance"
    );
  });

  it("shows all art pieces again and removes the genre from the address when All genres is selected", async () => {
    mockArtPieces();
    const user = userEvent.setup();
    renderAppWithLocation("/art-pieces?genre=Renaissance");
    const control = await findGenreControl();

    await user.selectOptions(control, "All genres");

    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(screen.getByTestId("search")).toBeEmptyDOMElement();
  });

  it("shows the control filled and the filtered list when the address has a genre", async () => {
    mockArtPieces();

    renderApp("/art-pieces?genre=Renaissance");

    expect(await findGenreControl()).toHaveValue("Renaissance");
    expect(screen.getAllByRole("listitem")).toHaveLength(1);
    expect(screen.getByText("The Harvesters")).toBeInTheDocument();
  });

  it("shows all art pieces when the genre of the address is unknown", async () => {
    mockArtPieces();

    renderApp("/art-pieces?genre=Unknown");

    expect(await findGenreControl()).toHaveValue("");
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });

  it("shows only the art pieces that match the search and the genre", async () => {
    mockArtPieces();

    renderApp("/art-pieces?q=e&genre=Renaissance");

    expect(await findGenreControl()).toHaveValue("Renaissance");
    expect(getSearchField()).toHaveValue("e");
    expect(screen.getAllByRole("listitem")).toHaveLength(1);
    expect(screen.getByText("The Harvesters")).toBeInTheDocument();
  });

  it("shows a message and keeps the genre control when nothing matches", async () => {
    mockArtPieces();

    renderApp("/art-pieces?q=gogh&genre=Renaissance");

    expect(await screen.findByRole("status")).toHaveTextContent(
      "No art pieces found"
    );
    expect(screen.getByRole("combobox", { name: "Genre" })).toHaveValue(
      "Renaissance"
    );
  });

  it("keeps the genre when the search text changes", async () => {
    mockArtPieces();
    const user = userEvent.setup();
    renderAppWithLocation("/art-pieces?genre=Renaissance");
    await findGenreControl();

    await user.type(getSearchField(), "bruegel");

    expect(screen.getByTestId("search")).toHaveTextContent(
      "?q=bruegel&genre=Renaissance"
    );
    expect(screen.getAllByRole("listitem")).toHaveLength(1);
  });

  it("keeps the genre when the search text is cleared", async () => {
    mockArtPieces();
    const user = userEvent.setup();
    renderAppWithLocation("/art-pieces?q=bruegel&genre=Renaissance");
    await findGenreControl();

    await user.clear(getSearchField());

    expect(screen.getByTestId("search")).toHaveTextContent(
      "?genre=Renaissance"
    );
    expect(screen.getAllByRole("listitem")).toHaveLength(1);
  });

  it("keeps the search text when the genre changes", async () => {
    mockArtPieces();
    const user = userEvent.setup();
    renderAppWithLocation("/art-pieces?q=e");

    await user.selectOptions(await findGenreControl(), "Post-Impressionism");

    expect(screen.getByTestId("search")).toHaveTextContent(
      "?q=e&genre=Post-Impressionism"
    );
    expect(getSearchField()).toHaveValue("e");
    expect(screen.getAllByRole("listitem")).toHaveLength(1);
  });

  it("returns to the filtered Gallery with Back on the details page", async () => {
    mockArtPieces();
    const user = userEvent.setup();
    renderApp("/art-pieces?genre=Renaissance");
    await findGenreControl();

    await user.click(screen.getByRole("link", { name: /The Harvesters/ }));
    await user.click(screen.getByRole("link", { name: "Back" }));

    expect(await findGenreControl()).toHaveValue("Renaissance");
    expect(screen.getAllByRole("listitem")).toHaveLength(1);
  });

  it("does not filter the Favorites page by the genre of the address", async () => {
    localStorage.setItem(
      "art-pieces-info",
      JSON.stringify([
        { slug: "wheat-field-with-cypresses", isFavorite: true, comments: [] },
      ])
    );
    mockArtPieces();

    renderApp("/favorites?genre=Renaissance");

    expect(await screen.findAllByRole("listitem")).toHaveLength(1);
    expect(screen.getByText("Vincent van Gogh")).toBeInTheDocument();
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
  });

  it("shows no genre control on the Spotlight page", async () => {
    mockRandom(0.999);
    mockArtPieces();

    renderApp("/?genre=Renaissance");

    expect(
      await screen.findByRole("img", { name: "Wheat Field with Cypresses" })
    ).toBeInTheDocument();
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
  });

  it("opens the Gallery without the genre when the search starts on another page", async () => {
    mockRandom(0.999);
    mockArtPieces();
    const user = userEvent.setup();
    renderAppWithLocation("/?genre=Renaissance");
    await screen.findByRole("img", { name: "Wheat Field with Cypresses" });

    await user.type(getSearchField(), "gogh");

    expect(screen.getByTestId("search")).toHaveTextContent("?q=gogh");
    expect(screen.getByTestId("search")).not.toHaveTextContent("genre");
  });

  it("keeps the genre of the address when the search text changes while the art pieces are loading", async () => {
    vi.stubGlobal("fetch", vi.fn().mockReturnValue(new Promise(() => {})));
    const user = userEvent.setup();
    renderAppWithLocation("/art-pieces?genre=Renaissance");

    await user.type(getSearchField(), "bruegel");

    expect(screen.getByTestId("search")).toHaveTextContent(
      "?q=bruegel&genre=Renaissance"
    );
  });
});
