import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import BackToTop from "./BackToTop";

function scrollTo(position: number) {
  Object.defineProperty(window, "scrollY", {
    configurable: true,
    value: position,
  });
  fireEvent.scroll(window);
}

afterEach(() => {
  Object.defineProperty(window, "scrollY", { configurable: true, value: 0 });
  vi.restoreAllMocks();
});

describe("BackToTop", () => {
  it("is not in the page while the page is at the top", () => {
    render(<BackToTop onClick={() => {}} />);

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("displays a button labeled Back to top after scrolling down", () => {
    render(<BackToTop onClick={() => {}} />);

    scrollTo(500);

    expect(
      screen.getByRole("button", { name: "Back to top" })
    ).toBeInTheDocument();
  });

  it("shows the button only after more than 400 px", () => {
    render(<BackToTop onClick={() => {}} />);

    scrollTo(400);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();

    scrollTo(401);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("hides the button again when the page is scrolled back to the top", () => {
    render(<BackToTop onClick={() => {}} />);
    scrollTo(500);

    scrollTo(0);

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("shows the button at once when the page is already scrolled", () => {
    Object.defineProperty(window, "scrollY", {
      configurable: true,
      value: 500,
    });

    render(<BackToTop onClick={() => {}} />);

    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("calls onClick when the button is clicked", async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(<BackToTop onClick={onClick} />);
    scrollTo(500);

    await user.click(screen.getByRole("button", { name: "Back to top" }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it.each([["{Enter}"], [" "]])(
    "can be used with the keyboard (%j)",
    async (key) => {
      const onClick = vi.fn();
      const user = userEvent.setup();
      render(<BackToTop onClick={onClick} />);
      scrollTo(500);

      await user.tab();
      expect(screen.getByRole("button")).toHaveFocus();
      await user.keyboard(key);

      expect(onClick).toHaveBeenCalledTimes(1);
    }
  );

  it("hides the icon from screen readers", () => {
    const { container } = render(<BackToTop onClick={() => {}} />);
    scrollTo(500);

    expect(container.querySelector("svg")).toHaveAttribute(
      "aria-hidden",
      "true"
    );
  });

  it("removes its scroll listener when it is removed from the page", () => {
    const removeEventListener = vi.spyOn(window, "removeEventListener");
    const { unmount } = render(<BackToTop onClick={() => {}} />);

    unmount();

    expect(removeEventListener).toHaveBeenCalledWith(
      "scroll",
      expect.any(Function)
    );
  });
});
