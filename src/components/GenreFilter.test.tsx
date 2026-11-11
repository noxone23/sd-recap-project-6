import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import GenreFilter from "./GenreFilter";

const genres = ["Baroque", "Renaissance"];

describe("GenreFilter", () => {
  it("has a control labeled Genre", () => {
    render(<GenreFilter genres={genres} value="" onChange={() => {}} />);

    expect(screen.getByRole("combobox", { name: "Genre" })).toBeInTheDocument();
  });

  it("offers All genres first and then one option for each genre", () => {
    render(<GenreFilter genres={genres} value="" onChange={() => {}} />);

    expect(
      screen.getAllByRole("option").map((option) => option.textContent)
    ).toEqual(["All genres", "Baroque", "Renaissance"]);
  });

  it("selects All genres when the value is empty", () => {
    render(<GenreFilter genres={genres} value="" onChange={() => {}} />);

    expect(screen.getByRole("option", { name: "All genres" })).toHaveProperty(
      "selected",
      true
    );
  });

  it("selects the option of the value", () => {
    render(<GenreFilter genres={genres} value="Baroque" onChange={() => {}} />);

    expect(screen.getByRole("combobox", { name: "Genre" })).toHaveValue(
      "Baroque"
    );
  });

  it("calls onChange with the selected genre", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<GenreFilter genres={genres} value="" onChange={onChange} />);

    await user.selectOptions(
      screen.getByRole("combobox", { name: "Genre" }),
      "Renaissance"
    );

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith("Renaissance");
  });

  it("calls onChange with an empty text when All genres is selected", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<GenreFilter genres={genres} value="Baroque" onChange={onChange} />);

    await user.selectOptions(
      screen.getByRole("combobox", { name: "Genre" }),
      "All genres"
    );

    expect(onChange).toHaveBeenCalledWith("");
  });
});
