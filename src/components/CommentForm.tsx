import { useState } from "react";
import type { FormEvent } from "react";

interface CommentFormProps {
  onAddComment: (text: string) => void;
}

export default function CommentForm({ onAddComment }: CommentFormProps) {
  const [text, setText] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedText = text.trim();

    if (trimmedText === "") {
      return;
    }

    onAddComment(trimmedText);
    setText("");
  }

  return (
    <form className="comment-form" onSubmit={handleSubmit}>
      <label htmlFor="comment-text">Comment</label>
      <input
        id="comment-text"
        type="text"
        value={text}
        required
        onChange={(event) => setText(event.target.value)}
      />
      <button type="submit">Add comment</button>
    </form>
  );
}
