import { Link } from "react-router";

import type { ArtPiece } from "../types";

interface ArtPieceDetailsProps {
  artPiece: ArtPiece;
}

export default function ArtPieceDetails({ artPiece }: ArtPieceDetailsProps) {
  return (
    <section className="details">
      <Link to="/art-pieces">Back</Link>
      <img src={artPiece.imageSource} alt={artPiece.name} />
      <h2>{artPiece.name}</h2>
      <p>{artPiece.artist}</p>
      <p>{artPiece.year}</p>
      <p>{artPiece.genre}</p>
    </section>
  );
}
