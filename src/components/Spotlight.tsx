import { useState } from "react";
import { Link } from "react-router";

import { getRandomArtPiece } from "../getRandomArtPiece";
import type { ArtPiece } from "../types";
import FavoriteButton from "./FavoriteButton";

interface SpotlightProps {
  artPieces: ArtPiece[];
  isFavorite: (slug: string) => boolean;
  onToggleFavorite: (slug: string) => void;
}

export default function Spotlight({
  artPieces,
  isFavorite,
  onToggleFavorite,
}: SpotlightProps) {
  const [artPiece, setArtPiece] = useState<ArtPiece | undefined>(() =>
    artPieces.length > 0 ? getRandomArtPiece(artPieces) : undefined
  );

  if (!artPiece) {
    return null;
  }

  return (
    <section className="spotlight">
      <Link to={`/art-pieces/${artPiece.slug}`}>
        <img src={artPiece.imageSource} alt={artPiece.name} />
      </Link>
      <FavoriteButton
        name={artPiece.name}
        isFavorite={isFavorite(artPiece.slug)}
        onToggle={() => onToggleFavorite(artPiece.slug)}
      />
      <h2>{artPiece.name}</h2>
      <p>{artPiece.artist}</p>
      {artPieces.length > 1 && (
        <button
          type="button"
          onClick={() =>
            setArtPiece((current) => getRandomArtPiece(artPieces, current))
          }
        >
          Show another
        </button>
      )}
    </section>
  );
}
