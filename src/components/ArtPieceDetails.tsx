import { Link } from "react-router";

import type { ArtPiece, ArtPieceComment } from "../types";
import CommentForm from "./CommentForm";
import Comments from "./Comments";
import FavoriteButton from "./FavoriteButton";

interface ArtPieceDetailsProps {
  artPiece: ArtPiece;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  comments: ArtPieceComment[];
  onAddComment: (text: string) => void;
}

export default function ArtPieceDetails({
  artPiece,
  isFavorite,
  onToggleFavorite,
  comments,
  onAddComment,
}: ArtPieceDetailsProps) {
  return (
    <section className="details">
      <Link to="/art-pieces">Back</Link>
      <img src={artPiece.imageSource} alt={artPiece.name} />
      <FavoriteButton
        name={artPiece.name}
        isFavorite={isFavorite}
        onToggle={onToggleFavorite}
      />
      <h2>{artPiece.name}</h2>
      <p>{artPiece.artist}</p>
      <p>{artPiece.year}</p>
      <p>{artPiece.genre}</p>
      <Comments comments={comments} />
      <CommentForm onAddComment={onAddComment} />
    </section>
  );
}
