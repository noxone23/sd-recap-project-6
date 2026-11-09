import { useState } from "react";

import { getRandomArtPiece } from "../getRandomArtPiece";
import type { ArtPiece } from "../types";

interface SpotlightProps {
  artPieces: ArtPiece[];
}

export default function Spotlight({ artPieces }: SpotlightProps) {
  const [artPiece] = useState<ArtPiece | undefined>(() =>
    artPieces.length > 0 ? getRandomArtPiece(artPieces) : undefined
  );

  if (!artPiece) {
    return null;
  }

  return (
    <section className="spotlight">
      <img src={artPiece.imageSource} alt={artPiece.name} />
      <p>{artPiece.artist}</p>
    </section>
  );
}
