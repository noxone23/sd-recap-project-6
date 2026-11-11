import { Link, useLocation } from "react-router";

import type { ArtPiece, ArtPieceComment } from "../types";
import ColorPalette from "./ColorPalette";
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

function getBackPath(state: unknown) {
  const from = (state as { from?: unknown } | null)?.from;

  return typeof from === "string" && /^\/(?!\/)/.test(from)
    ? from
    : "/art-pieces";
}

export default function ArtPieceDetails({
  artPiece,
  isFavorite,
  onToggleFavorite,
  comments,
  onAddComment,
}: ArtPieceDetailsProps) {
  const { state } = useLocation();

  return (
    <section className="details">
      <Link to={getBackPath(state)}>Back</Link>
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
      <ColorPalette colors={artPiece.colors} />
      <Comments comments={comments} />
      <CommentForm onAddComment={onAddComment} />
    </section>
  );
}
