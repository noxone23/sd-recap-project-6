export interface ArtPiece {
  slug: string;
  name: string;
  artist: string;
  imageSource: string;
  year: string;
  genre: string;
}

export interface ArtPieceInfo {
  slug: string;
  isFavorite: boolean;
}
