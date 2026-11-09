import { useState } from "react";

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
  const [artPiece] = useState<ArtPiece | undefined>(() =>
    artPieces.length > 0 ? getRandomArtPiece(artPieces) : undefined
  );

  if (!artPiece) {
    return null;
  }

  return (
    <section className="spotlight">
      <img src={artPiece.imageSource} alt={artPiece.name} />
      <FavoriteButton
        name={artPiece.name}
        isFavorite={isFavorite(artPiece.slug)}
        onToggle={() => onToggleFavorite(artPiece.slug)}
      />
      <p>{artPiece.artist}</p>
    </section>
  );
}
