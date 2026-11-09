import type { ReactNode } from "react";
import { Route, Routes, useParams } from "react-router";
import useSWR from "swr";

import ArtPieceDetails from "./components/ArtPieceDetails";
import ArtPieceList from "./components/ArtPieceList";
import Navigation from "./components/Navigation";
import Spotlight from "./components/Spotlight";
import { fetcher } from "./fetcher";
import "./styles.css";
import type { ArtPiece } from "./types";

const API_URL = "https://example-apis.vercel.app/api/art";

function ArtPieceDetailsRoute({ artPieces }: { artPieces: ArtPiece[] }) {
  const { slug } = useParams();
  const artPiece = artPieces.find((piece) => piece.slug === slug);

  if (!artPiece) {
    return <p>Art piece not found</p>;
  }

  return <ArtPieceDetails artPiece={artPiece} />;
}

export default function App() {
  const {
    data: artPieces,
    error,
    isLoading,
  } = useSWR<ArtPiece[]>(API_URL, fetcher);

  let content: ReactNode;

  if (isLoading) {
    content = <p>Loading...</p>;
  } else if (error || !artPieces) {
    content = <p>Failed to load art pieces.</p>;
  } else {
    content = (
      <Routes>
        <Route path="/" element={<Spotlight artPieces={artPieces} />} />
        <Route
          path="/art-pieces"
          element={<ArtPieceList artPieces={artPieces} />}
        />
        <Route
          path="/art-pieces/:slug"
          element={<ArtPieceDetailsRoute artPieces={artPieces} />}
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
