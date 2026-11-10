import { useState } from "react";

import { filterArtPieces } from "../filterArtPieces";
import type { ArtPiece } from "../types";
import ArtPieceList from "./ArtPieceList";
import SearchField from "./SearchField";

interface GalleryProps {
  artPieces: ArtPiece[];
  isFavorite: (slug: string) => boolean;
  onToggleFavorite: (slug: string) => void;
}

export default function Gallery({
  artPieces,
  isFavorite,
  onToggleFavorite,
}: GalleryProps) {
  const [query, setQuery] = useState("");
  const filteredArtPieces = filterArtPieces(artPieces, query);

  return (
    <>
      <SearchField value={query} onChange={setQuery} />
      {filteredArtPieces.length === 0 ? (
        <p>No art pieces found</p>
      ) : (
        <ArtPieceList
          artPieces={filteredArtPieces}
          isFavorite={isFavorite}
          onToggleFavorite={onToggleFavorite}
        />
      )}
    </>
  );
}
