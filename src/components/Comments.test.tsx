import { render, screen, within } from "@testing-library/react";

import type { ArtPieceComment } from "../types";
import Comments from "./Comments";

const comments: ArtPieceComment[] = [
  { text: "Beautiful colors", date: "2026-11-09T10:15:00.000Z" },
  { text: "Reminds me of summer", date: "2026-11-10T18:30:00.000Z" },
];

describe("Comments", () => {
  it("displays a section labeled Comments", () => {
    render(<Comments comments={comments} />);

    expect(
      screen.getByRole("region", { name: "Comments" })
    ).toBeInTheDocument();
  });

  it("displays no list without comments", () => {
    render(<Comments comments={[]} />);

    expect(
      screen.getByRole("region", { name: "Comments" })
    ).toBeInTheDocument();
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });

  it("displays a list item for each comment", () => {
    render(<Comments comments={comments} />);

    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });

  it("displays the text of each comment", () => {
    render(<Comments comments={comments} />);

    expect(screen.getByText("Beautiful colors")).toBeInTheDocument();
    expect(screen.getByText("Reminds me of summer")).toBeInTheDocument();
  });

  it("displays the date and time of each comment", () => {
    render(<Comments comments={comments} />);

    const [first, second] = screen.getAllByRole("listitem");
    const firstTime = within(first).getByText(
      new Date(comments[0].date).toLocaleString()
    );
    expect(firstTime).toHaveAttribute("datetime", comments[0].date);
    expect(
      within(second).getByText(new Date(comments[1].date).toLocaleString())
    ).toHaveAttribute("datetime", comments[1].date);
  });
});
