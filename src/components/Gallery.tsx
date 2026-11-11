import { filterArtPieces } from "../filterArtPieces";
import { getGenres } from "../getGenres";
import type { ArtPiece } from "../types";
import ArtPieceList from "./ArtPieceList";
import GenreFilter from "./GenreFilter";

interface GalleryProps {
  artPieces: ArtPiece[];
  query: string;
  genre: string;
  onGenreChange: (genre: string) => void;
  isFavorite: (slug: string) => boolean;
  onToggleFavorite: (slug: string) => void;
}

export default function Gallery({
  artPieces,
  query,
  genre,
  onGenreChange,
  isFavorite,
  onToggleFavorite,
}: GalleryProps) {
  const filteredArtPieces = filterArtPieces(artPieces, query, genre);

  return (
    <>
      <GenreFilter
        genres={getGenres(artPieces)}
        value={genre}
        onChange={onGenreChange}
      />
      {filteredArtPieces.length === 0 ? (
        <p role="status">No art pieces found</p>
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
