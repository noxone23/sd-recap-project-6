import { matchPath } from "react-router";

import type { ArtPiece } from "./types";

export const APP_TITLE = "Art Gallery";

function withAppTitle(title: string) {
  return `${title} – ${APP_TITLE}`;
}

export function getPageTitle(pathname: string, artPieces: ArtPiece[]) {
  if (matchPath("/", pathname)) {
    return APP_TITLE;
  }

  if (matchPath("/art-pieces", pathname)) {
    return withAppTitle("Gallery");
  }

  if (matchPath("/favorites", pathname)) {
    return withAppTitle("Favorites");
  }

  const details = matchPath("/art-pieces/:slug", pathname);

  if (details) {
    const artPiece = artPieces.find(
      (piece) => piece.slug === details.params.slug
    );

    return withAppTitle(artPiece ? artPiece.name : "Art piece not found");
  }

  return withAppTitle("Page not found");
}
