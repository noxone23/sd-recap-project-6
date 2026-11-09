import { useState } from "react";
import type { ReactNode } from "react";
import { Route, Routes, useParams } from "react-router";
import useSWR from "swr";

import ArtPieceDetails from "./components/ArtPieceDetails";
import ArtPieceList from "./components/ArtPieceList";
import Navigation from "./components/Navigation";
import Spotlight from "./components/Spotlight";
import { fetcher } from "./fetcher";
import "./styles.css";
import type { ArtPiece, ArtPieceInfo } from "./types";

const API_URL = "https://example-apis.vercel.app/api/art";

interface ArtPieceDetailsRouteProps {
  artPieces: ArtPiece[];
  isFavorite: (slug: string) => boolean;
  onToggleFavorite: (slug: string) => void;
}

function ArtPieceDetailsRoute({
  artPieces,
  isFavorite,
  onToggleFavorite,
}: ArtPieceDetailsRouteProps) {
  const { slug } = useParams();
  const artPiece = artPieces.find((piece) => piece.slug === slug);

  if (!artPiece) {
    return <p>Art piece not found</p>;
  }

  return (
    <ArtPieceDetails
      artPiece={artPiece}
      isFavorite={isFavorite(artPiece.slug)}
      onToggleFavorite={() => onToggleFavorite(artPiece.slug)}
    />
  );
}

export default function App() {
  const {
    data: artPieces,
    error,
    isLoading,
  } = useSWR<ArtPiece[]>(API_URL, fetcher);
  const [artPieceInfo, setArtPieceInfo] = useState<ArtPieceInfo[]>([]);

  function isFavorite(slug: string) {
    return artPieceInfo.some((info) => info.slug === slug && info.isFavorite);
  }

  function toggleFavorite(slug: string) {
    setArtPieceInfo((current) =>
      current.some((info) => info.slug === slug)
        ? current.map((info) =>
            info.slug === slug
              ? { ...info, isFavorite: !info.isFavorite }
              : info
          )
        : [...current, { slug, isFavorite: true }]
    );
  }

  let content: ReactNode;

  if (isLoading) {
    content = <p>Loading...</p>;
  } else if (error || !artPieces) {
    content = <p>Failed to load art pieces.</p>;
  } else {
    const favoriteArtPieces = artPieces.filter((piece) =>
      isFavorite(piece.slug)
    );

    content = (
      <Routes>
        <Route
          path="/"
          element={
            <Spotlight
              artPieces={artPieces}
              isFavorite={isFavorite}
              onToggleFavorite={toggleFavorite}
            />
          }
        />
        <Route
          path="/art-pieces"
          element={
            <ArtPieceList
              artPieces={artPieces}
              isFavorite={isFavorite}
              onToggleFavorite={toggleFavorite}
            />
          }
        />
        <Route
          path="/art-pieces/:slug"
          element={
            <ArtPieceDetailsRoute
              artPieces={artPieces}
              isFavorite={isFavorite}
              onToggleFavorite={toggleFavorite}
            />
          }
        />
        <Route
          path="/favorites"
          element={
            favoriteArtPieces.length === 0 ? (
              <p>No favorites yet.</p>
            ) : (
              <ArtPieceList
                artPieces={favoriteArtPieces}
                isFavorite={isFavorite}
                onToggleFavorite={toggleFavorite}
              />
            )
          }
        />
        <Route path="*" element={<p>Page not found</p>} />
      </Routes>
    );
  }

  return (
    <>
      <main>
        <h1>Art Gallery</h1>
        {content}
      </main>
      <Navigation />
    </>
  );
}
