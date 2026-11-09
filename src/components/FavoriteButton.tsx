import { Heart } from "lucide-react";

interface FavoriteButtonProps {
  name: string;
  isFavorite: boolean;
  onToggle: () => void;
}

export default function FavoriteButton({
  name,
  isFavorite,
  onToggle,
}: FavoriteButtonProps) {
  return (
    <button
      type="button"
      className="favorite-button"
      aria-label={`Favorite ${name}`}
      aria-pressed={isFavorite}
      onClick={onToggle}
    >
      <Heart aria-hidden="true" fill={isFavorite ? "currentColor" : "none"} />
    </button>
  );
}
