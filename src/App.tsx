import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import {
  Link,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router";
import useSWR from "swr";

import { loadArtPiecesInfo, saveArtPiecesInfo } from "./artPieceInfoStorage";
import ArtPieceDetails from "./components/ArtPieceDetails";
import ArtPieceList from "./components/ArtPieceList";
import BackToTop from "./components/BackToTop";
import Gallery from "./components/Gallery";
import MouseTrail from "./components/MouseTrail";
import Navigation from "./components/Navigation";
import NotFound from "./components/NotFound";
import SearchField from "./components/SearchField";
import Spotlight from "./components/Spotlight";
import ThemeToggle from "./components/ThemeToggle";
import { fetcher } from "./fetcher";
import { getGenres } from "./getGenres";
import { APP_TITLE, getPageTitle } from "./getPageTitle";
import "./styles.css";
import { getInitialTheme, saveTheme } from "./theme";
import type { Theme } from "./theme";
import type { ArtPiece, ArtPieceComment, ArtPieceInfo } from "./types";

const API_URL = "https://example-apis.vercel.app/api/art";

function createGallerySearchParams(query: string, genre: string) {
  const params = new URLSearchParams();

  if (query) {
    params.set("q", query);
  }

  if (genre) {
    params.set("genre", genre);
  }

  return params;
}

interface ArtPieceDetailsRouteProps {
  artPieces: ArtPiece[];
  isFavorite: (slug: string) => boolean;
  onToggleFavorite: (slug: string) => void;
  getComments: (slug: string) => ArtPieceComment[];
  onAddComment: (slug: string, text: string) => void;
}

function ArtPieceDetailsRoute({
  artPieces,
  isFavorite,
  onToggleFavorite,
  getComments,
  onAddComment,
}: ArtPieceDetailsRouteProps) {
  const { slug } = useParams();
  const artPiece = artPieces.find((piece) => piece.slug === slug);

  if (!artPiece) {
    return <NotFound message="Art piece not found" />;
  }

  return (
    <ArtPieceDetails
      artPiece={artPiece}
      isFavorite={isFavorite(artPiece.slug)}
      onToggleFavorite={() => onToggleFavorite(artPiece.slug)}
      comments={getComments(artPiece.slug)}
      onAddComment={(text) => onAddComment(artPiece.slug, text)}
    />
  );
}

export default function App() {
  const {
    data: artPieces,
    error,
    isLoading,
  } = useSWR<ArtPiece[]>(API_URL, fetcher);
  const [artPieceInfo, setArtPieceInfo] =
    useState<ArtPieceInfo[]>(loadArtPiecesInfo);

  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const isGallery =
    location.pathname === "/art-pieces" || location.pathname === "/art-pieces/";
  const query = isGallery ? (searchParams.get("q") ?? "") : "";
  const requestedGenre = isGallery ? (searchParams.get("genre") ?? "") : "";
  const genre =
    artPieces && getGenres(artPieces).includes(requestedGenre)
      ? requestedGenre
      : "";

  function handleSearch(value: string) {
    if (isGallery) {
      setSearchParams(createGallerySearchParams(value, genre), {
        replace: true,
      });
    } else if (value) {
      void navigate({
        pathname: "/art-pieces",
        search: `?${new URLSearchParams({ q: value })}`,
      });
    }
  }

  function handleGenreChange(value: string) {
    setSearchParams(createGallerySearchParams(query, value), {
      replace: true,
    });
  }

  useEffect(() => {
    saveArtPiecesInfo(artPieceInfo);
  }, [artPieceInfo]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const pageTitle = artPieces
    ? getPageTitle(location.pathname, artPieces)
    : APP_TITLE;

  useEffect(() => {
    const previousTitle = document.title;

    document.title = pageTitle;

    return () => {
      document.title = previousTitle;
    };
  }, [pageTitle]);

  const titleRef = useRef<HTMLHeadingElement>(null);

  function handleBackToTop() {
    window.scrollTo({ top: 0 });
    titleRef.current?.focus({ preventScroll: true });
  }

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";

    setTheme(next);
    saveTheme(next);
  }

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
        : [...current, { slug, isFavorite: true, comments: [] }]
    );
  }

  function getComments(slug: string) {
    return artPieceInfo.find((info) => info.slug === slug)?.comments ?? [];
  }

  function addComment(slug: string, text: string) {
    const comment = { text, date: new Date().toISOString() };

    setArtPieceInfo((current) =>
      current.some((info) => info.slug === slug)
        ? current.map((info) =>
            info.slug === slug
              ? { ...info, comments: [...info.comments, comment] }
              : info
          )
        : [...current, { slug, isFavorite: false, comments: [comment] }]
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
            <Gallery
              artPieces={artPieces}
              query={query}
              genre={genre}
              onGenreChange={handleGenreChange}
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
              getComments={getComments}
              onAddComment={addComment}
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
        <Route path="*" element={<NotFound message="Page not found" />} />
      </Routes>
    );
  }

  return (
    <>
      <header>
        <h1 ref={titleRef} tabIndex={-1}>
          <Link to="/" tabIndex={-1}>
            Art Gallery
          </Link>
        </h1>
        <SearchField value={query} onChange={handleSearch} />
        <ThemeToggle theme={theme} onToggle={toggleTheme} />
        <Navigation />
      </header>
      <main>{content}</main>
      <BackToTop onClick={handleBackToTop} />
      <MouseTrail />
    </>
  );
}
