import type { ArtPieceInfo } from "./types";

const STORAGE_KEY = "art-pieces-info";

export function loadArtPiecesInfo(): ArtPieceInfo[] {
  const saved = localStorage.getItem(STORAGE_KEY);

  if (saved === null) {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(saved);

    return Array.isArray(parsed) ? (parsed as ArtPieceInfo[]) : [];
  } catch {
    return [];
  }
}

export function saveArtPiecesInfo(artPiecesInfo: ArtPieceInfo[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(artPiecesInfo));
}
