import { ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";

const SCROLL_THRESHOLD = 400;

interface BackToTopProps {
  onClick: () => void;
}

export default function BackToTop({ onClick }: BackToTopProps) {
  const [isScrolled, setIsScrolled] = useState(
    () => window.scrollY > SCROLL_THRESHOLD
  );

  useEffect(() => {
    function handleScroll() {
      setIsScrolled(window.scrollY > SCROLL_THRESHOLD);
    }

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!isScrolled) {
    return null;
  }

  return (
    <button
      type="button"
      className="back-to-top"
      aria-label="Back to top"
      onClick={onClick}
    >
      <ArrowUp aria-hidden="true" />
    </button>
  );
}
