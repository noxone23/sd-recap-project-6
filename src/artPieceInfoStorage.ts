import type { ArtPieceInfo } from "./types";

const STORAGE_KEY = "art-pieces-info";

function isArtPieceInfo(value: unknown): value is ArtPieceInfo {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const { slug, isFavorite, comments } = value as Partial<ArtPieceInfo>;

  return (
    typeof slug === "string" &&
    typeof isFavorite === "boolean" &&
    Array.isArray(comments)
  );
}

export function loadArtPiecesInfo(): ArtPieceInfo[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved === null) {
      return [];
    }

    const parsed: unknown = JSON.parse(saved);

    return Array.isArray(parsed) ? parsed.filter(isArtPieceInfo) : [];
  } catch {
    return [];
  }
}

export function saveArtPiecesInfo(artPiecesInfo: ArtPieceInfo[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(artPiecesInfo));
  } catch {
    // The app keeps working with the data in memory.
  }
}
