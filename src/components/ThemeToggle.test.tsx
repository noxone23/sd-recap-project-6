import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import ThemeToggle from "./ThemeToggle";

describe("ThemeToggle", () => {
  it("offers to switch to dark mode in the light theme", () => {
    render(<ThemeToggle theme="light" onToggle={() => {}} />);

    expect(
      screen.getByRole("button", { name: "Switch to dark mode" })
    ).toBeInTheDocument();
  });

  it("offers to switch to light mode in the dark theme", () => {
    render(<ThemeToggle theme="dark" onToggle={() => {}} />);

    expect(
      screen.getByRole("button", { name: "Switch to light mode" })
    ).toBeInTheDocument();
  });

  it("calls onToggle when the button is clicked", async () => {
    const onToggle = vi.fn();
    const user = userEvent.setup();
    render(<ThemeToggle theme="light" onToggle={onToggle} />);

    await user.click(screen.getByRole("button"));

    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it.each([["{Enter}"], [" "]])(
    "can be used with the keyboard (%j)",
    async (key) => {
      const onToggle = vi.fn();
      const user = userEvent.setup();
      render(<ThemeToggle theme="light" onToggle={onToggle} />);

      await user.tab();
      expect(screen.getByRole("button")).toHaveFocus();
      await user.keyboard(key);

      expect(onToggle).toHaveBeenCalledTimes(1);
    }
  );

  it("hides the icon from screen readers", () => {
    const { container } = render(
      <ThemeToggle theme="light" onToggle={() => {}} />
    );

    expect(container.querySelector("svg")).toHaveAttribute(
      "aria-hidden",
      "true"
    );
  });
});
