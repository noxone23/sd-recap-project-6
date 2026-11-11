import css from "./styles.css?raw";

interface Rule {
  selectors: string[];
  declarations: string;
  atRules: string[];
}

function parseRules(source: string): Rule[] {
  const text = source.replace(/\/\*[\s\S]*?\*\//g, "");
  const rules: Rule[] = [];
  const stack: { prelude: string; start: number; hasChild: boolean }[] = [];
  let cursor = 0;

  for (let index = 0; index < text.length; index++) {
    if (text[index] === "{") {
      if (stack.length > 0) {
        stack[stack.length - 1].hasChild = true;
      }
      stack.push({
        prelude: text.slice(cursor, index).trim(),
        start: index + 1,
        hasChild: false,
      });
      cursor = index + 1;
    } else if (text[index] === "}") {
      const block = stack.pop();

      if (block && !block.hasChild) {
        rules.push({
          selectors: block.prelude
            .split(",")
            .map((selector) => selector.trim()),
          declarations: text.slice(block.start, index),
          atRules: stack.map((parent) => parent.prelude),
        });
      }
      cursor = index + 1;
    }
  }

  return rules;
}

const rules = parseRules(css);

function declarationsOf(selector: string) {
  return rules
    .filter((rule) => rule.selectors.includes(selector))
    .map((rule) => rule.declarations)
    .join("\n");
}

function usesGold(selector: string, property: string) {
  return new RegExp(`(?:^|[;\\s])${property}:[^;]*var\\(--gold\\)`).test(
    declarationsOf(selector)
  );
}

function findColorRules(name: string) {
  return rules
    .map((rule) => ({
      rule,
      value: rule.declarations.match(
        new RegExp(`${name}:\\s*(#[0-9a-fA-F]{6})`)
      )?.[1],
    }))
    .filter(
      (entry): entry is { rule: Rule; value: string } =>
        entry.value !== undefined
    );
}

function getThemeColor(name: string, theme: "light" | "dark") {
  const entry = findColorRules(name).find(({ rule }) =>
    theme === "light"
      ? rule.selectors.includes(":root") && rule.atRules.length === 0
      : rule.selectors.includes(':root[data-theme="dark"]')
  );

  return entry?.value ?? "";
}

function getLuminance(hex: string) {
  const [red, green, blue] = [1, 3, 5]
    .map((start) => parseInt(hex.slice(start, start + 2), 16) / 255)
    .map((value) =>
      value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
    );

  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

function getContrast(first: string, second: string) {
  const [lighter, darker] = [getLuminance(first), getLuminance(second)].sort(
    (a, b) => b - a
  );

  return (lighter + 0.05) / (darker + 0.05);
}

describe("the style sheet", () => {
  it("is read as text with its rules", () => {
    expect(css.length).toBeGreaterThan(0);
    expect(rules.length).toBeGreaterThan(50);
    expect(getThemeColor("--wall", "light")).not.toBe("");
    expect(getThemeColor("--wall", "dark")).not.toBe("");
  });
});

describe("the gold color", () => {
  const goldRules = findColorRules("--gold");

  it("is defined for the light theme, the dark theme and the system dark mode", () => {
    expect(goldRules).toHaveLength(3);
    expect(getThemeColor("--gold", "light")).not.toBe("");
    expect(getThemeColor("--gold", "dark")).not.toBe("");
    expect(
      goldRules.some(
        ({ rule }) =>
          rule.selectors.includes(':root:not([data-theme="light"])') &&
          rule.atRules.some((atRule) => atRule.includes("prefers-color-scheme"))
      )
    ).toBe(true);
  });

  it("is lighter in the dark theme than in the light theme", () => {
    expect(getLuminance(getThemeColor("--gold", "dark"))).toBeGreaterThan(
      getLuminance(getThemeColor("--gold", "light"))
    );
  });

  it("has the same value in the dark theme and in the system dark mode", () => {
    const dark = getThemeColor("--gold", "dark");
    const system = goldRules.find(({ rule }) => rule.atRules.length > 0);

    expect(system?.value).toBe(dark);
  });

  it("is written as a color value only in its three definitions", () => {
    const light = getThemeColor("--gold", "light");
    const dark = getThemeColor("--gold", "dark");

    expect(css.split(light)).toHaveLength(2);
    expect(css.split(dark)).toHaveLength(3);
  });

  it.each(["light", "dark"] as const)(
    "has a contrast of at least 3 to 1 on the wall color of the %s theme",
    (theme) => {
      expect(
        getContrast(
          getThemeColor("--gold", theme),
          getThemeColor("--wall", theme)
        )
      ).toBeGreaterThanOrEqual(3);
    }
  );
});

describe("the gold lines, icons and borders", () => {
  it.each([
    [
      "the underline of the search field",
      'header input[type="search"]',
      "border-bottom",
    ],
    [
      "the focus line of the search field",
      'header input[type="search"]:focus-visible',
      "border-bottom-color",
    ],
    [
      "the focus shadow of the search field",
      'header input[type="search"]:focus-visible',
      "box-shadow",
    ],
    [
      "the underline of the genre control",
      ".genre-filter select",
      "border-bottom",
    ],
    [
      "the focus line of the genre control",
      ".genre-filter select:focus-visible",
      "border-bottom-color",
    ],
    [
      "the focus shadow of the genre control",
      ".genre-filter select:focus-visible",
      "box-shadow",
    ],
    [
      "the border of the active navigation link",
      "nav a.active",
      "border-color",
    ],
    ["the divider above the comments", ".details h3", "border-top"],
    ["the icon of the theme toggle", ".theme-toggle", "color"],
    ["the Back to top arrow", ".back-to-top", "color"],
    ["the border of the cards", ".art-piece", "border"],
    ["the border of the Spotlight box", ".spotlight", "border"],
    ["the border of the details box", ".details", "border"],
  ])("is used for %s", (_description, selector, property) => {
    expect(usesGold(selector, property)).toBe(true);
  });
});

describe("what stays without gold", () => {
  it.each([
    ["the header and its bottom line", "header"],
    ["the images of the cards", ".art-piece img"],
    ["the image of the Spotlight box", ".spotlight img"],
    ["the image of the details box", ".details img"],
    ["the favorite button", ".favorite-button"],
    ["the buttons of the comment form", ".comment-form button"],
    ["the comment boxes", ".comments li"],
  ])("does not use gold for %s", (_description, selector) => {
    expect(declarationsOf(selector)).not.toContain("var(--gold)");
  });

  it("keeps the blue focus ring of the keyboard", () => {
    expect(declarationsOf(":focus-visible")).toContain("var(--focus)");
    expect(declarationsOf(":focus-visible")).not.toContain("var(--gold)");
  });
});
