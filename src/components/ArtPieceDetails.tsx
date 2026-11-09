import { Link } from "react-router";

import type { ArtPiece } from "../types";
import FavoriteButton from "./FavoriteButton";

interface ArtPieceDetailsProps {
  artPiece: ArtPiece;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

export default function ArtPieceDetails({
  artPiece,
  isFavorite,
  onToggleFavorite,
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
    </section>
  );
}
