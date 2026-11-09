import type { ArtPieceComment } from "../types";

interface CommentsProps {
  comments: ArtPieceComment[];
}

export default function Comments({ comments }: CommentsProps) {
  return (
    <section aria-labelledby="comments-heading">
      <h3 id="comments-heading">Comments</h3>
      {comments.length > 0 && (
        <ul className="comments">
          {comments.map((comment) => (
            <li key={`${comment.date}-${comment.text}`}>
              <p>{comment.text}</p>
              <time dateTime={comment.date}>
                {new Date(comment.date).toLocaleString()}
              </time>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
