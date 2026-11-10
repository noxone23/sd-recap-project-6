import { getInitialTheme, loadTheme, saveTheme } from "./theme";

function mockSystemTheme(prefersDark: boolean) {
  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockReturnValue({ matches: prefersDark })
  );
}

afterEach(() => {
  localStorage.clear();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("loadTheme", () => {
  it("returns null when nothing is saved", () => {
    expect(loadTheme()).toBeNull();
  });

  it.each([["light"], ["dark"]] as const)(
    "returns the saved theme %s",
    (theme) => {
      saveTheme(theme);

      expect(loadTheme()).toBe(theme);
    }
  );

  it("returns null when the saved value is not a theme", () => {
    localStorage.setItem("theme", "blue");

    expect(loadTheme()).toBeNull();
  });

  it("returns null when the local storage cannot be read", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new DOMException("Access denied", "SecurityError");
    });

    expect(loadTheme()).toBeNull();
  });
});

describe("saveTheme", () => {
  it("writes the theme to the local storage", () => {
    saveTheme("dark");

    expect(localStorage.getItem("theme")).toBe("dark");
  });

  it("does not throw when the local storage cannot be written", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("Quota exceeded", "QuotaExceededError");
    });

    expect(() => saveTheme("dark")).not.toThrow();
  });
});

describe("getInitialTheme", () => {
  it("uses the dark system setting when nothing is saved", () => {
    mockSystemTheme(true);

    expect(getInitialTheme()).toBe("dark");
  });

  it("uses the light system setting when nothing is saved", () => {
    mockSystemTheme(false);

    expect(getInitialTheme()).toBe("light");
  });

  it("prefers the saved choice to the system setting", () => {
    mockSystemTheme(true);
    saveTheme("light");

    expect(getInitialTheme()).toBe("light");
  });

  it("is light when the system setting is not available", () => {
    expect(getInitialTheme()).toBe("light");
  });

  it("uses the system setting when the local storage cannot be read", () => {
    mockSystemTheme(true);
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new DOMException("Access denied", "SecurityError");
    });

    expect(getInitialTheme()).toBe("dark");
  });
});
