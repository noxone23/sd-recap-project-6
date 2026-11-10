import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import SearchField from "./SearchField";

describe("SearchField", () => {
  it("displays a text field labeled Search", () => {
    render(<SearchField value="" onChange={() => {}} />);

    expect(
      screen.getByRole("searchbox", { name: "Search" })
    ).toBeInTheDocument();
  });

  it("displays the given value", () => {
    render(<SearchField value="van gogh" onChange={() => {}} />);

    expect(screen.getByRole("searchbox", { name: "Search" })).toHaveValue(
      "van gogh"
    );
  });

  it("calls onChange with the typed text", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<SearchField value="" onChange={onChange} />);

    await user.type(screen.getByRole("searchbox", { name: "Search" }), "a");

    expect(onChange).toHaveBeenCalledWith("a");
  });
});
