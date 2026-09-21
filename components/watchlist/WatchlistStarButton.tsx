"use client";

import { useEffect, useRef, useState } from "react";
import { useWatchlist } from "@/components/watchlist/WatchlistProvider";

export function WatchlistStarButton({
  symbol,
  className = "",
}: {
  symbol: string;
  className?: string;
}) {
  const { hydrated, isWatched, toggle } = useWatchlist();
  const watched = hydrated && isWatched(symbol);

  const prevWatched = useRef(watched);
  const [pop, setPop] = useState(false);

  useEffect(() => {
    if (hydrated && watched !== prevWatched.current) {
      prevWatched.current = watched;
      setPop(true);
      const id = setTimeout(() => setPop(false), 420);
      return () => clearTimeout(id);
    }
    prevWatched.current = watched;
  }, [watched, hydrated]);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(symbol);
      }}
      aria-label={watched ? `Remove ${symbol} from watchlist` : `Add ${symbol} to watchlist`}
      aria-pressed={watched}
      title={watched ? "Remove from watchlist" : "Add to watchlist"}
      className={`text-lg leading-none transition-colors ${
        watched
          ? "text-tl-accent"
          : "text-tl-text-muted hover:text-tl-accent"
      } ${className}`}
    >
      <span className={pop ? "tl-star-pop" : "inline-block"}>
        {watched ? "★" : "☆"}
      </span>
    </button>
  );
}
