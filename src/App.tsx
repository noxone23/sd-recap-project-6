import { Route, Routes } from "react-router";
import useSWR from "swr";

import ArtPieceList from "./components/ArtPieceList";
import Spotlight from "./components/Spotlight";
import { fetcher } from "./fetcher";
import "./styles.css";
import type { ArtPiece } from "./types";

const API_URL = "https://example-apis.vercel.app/api/art";

export default function App() {
  const {
    data: artPieces,
    error,
    isLoading,
  } = useSWR<ArtPiece[]>(API_URL, fetcher);

  if (isLoading) {
    return <main>Loading...</main>;
  }

  if (error || !artPieces) {
    return <main>Failed to load art pieces.</main>;
  }

  return (
    <main>
      <h1>Art Gallery</h1>
      <Routes>
        <Route path="/" element={<Spotlight artPieces={artPieces} />} />
        <Route
          path="/art-pieces"
          element={<ArtPieceList artPieces={artPieces} />}
        />
      </Routes>
    </main>
  );
}
