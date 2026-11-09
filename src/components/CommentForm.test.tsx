import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import CommentForm from "./CommentForm";

describe("CommentForm", () => {
  it("displays a text field and a submit button", () => {
    render(<CommentForm onAddComment={() => {}} />);

    expect(
      screen.getByRole("textbox", { name: "Comment" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Add comment" })
    ).toBeInTheDocument();
  });

  it("calls onAddComment with the text and clears the field on submit", async () => {
    const onAddComment = vi.fn();
    const user = userEvent.setup();
    render(<CommentForm onAddComment={onAddComment} />);

    const field = screen.getByRole("textbox", { name: "Comment" });
    await user.type(field, "Beautiful colors");
    await user.click(screen.getByRole("button", { name: "Add comment" }));

    expect(onAddComment).toHaveBeenCalledTimes(1);
    expect(onAddComment).toHaveBeenCalledWith("Beautiful colors");
    expect(field).toHaveValue("");
  });

  it("trims the spaces around the text before calling onAddComment", async () => {
    const onAddComment = vi.fn();
    const user = userEvent.setup();
    render(<CommentForm onAddComment={onAddComment} />);

    await user.type(
      screen.getByRole("textbox", { name: "Comment" }),
      "  hello  "
    );
    await user.click(screen.getByRole("button", { name: "Add comment" }));

    expect(onAddComment).toHaveBeenCalledWith("hello");
  });

  it("does not call onAddComment for an empty comment", async () => {
    const onAddComment = vi.fn();
    const user = userEvent.setup();
    render(<CommentForm onAddComment={onAddComment} />);

    await user.click(screen.getByRole("button", { name: "Add comment" }));

    expect(onAddComment).not.toHaveBeenCalled();
  });

  it("does not call onAddComment for a comment with only spaces", async () => {
    const onAddComment = vi.fn();
    const user = userEvent.setup();
    render(<CommentForm onAddComment={onAddComment} />);

    await user.type(screen.getByRole("textbox", { name: "Comment" }), "   ");
    await user.click(screen.getByRole("button", { name: "Add comment" }));

    expect(onAddComment).not.toHaveBeenCalled();
  });
});
