export interface ArtPiece {
  slug: string;
  name: string;
  artist: string;
  imageSource: string;
  year: string;
  genre: string;
  colors: string[];
}

export interface ArtPieceComment {
  text: string;
  date: string;
}

export interface ArtPieceInfo {
  slug: string;
  isFavorite: boolean;
  comments: ArtPieceComment[];
}
