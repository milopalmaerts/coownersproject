"use client";

import { useEffect, useRef, useState } from "react";
import { formatPrice } from "@/lib/format";

// Pure presentational flash-on-change for a price value — takes no part in
// fetching, so many rows can each use this without each opening its own
// poll loop. Pair with a single useLiveTickers() call higher up the tree.
export function PriceFlash({ price }: { price: number }) {
  const prevPrice = useRef(price);
  const [flash, setFlash] = useState<"up" | "down" | null>(null);

  useEffect(() => {
    if (price !== prevPrice.current) {
      setFlash(price > prevPrice.current ? "up" : "down");
      prevPrice.current = price;
      const id = setTimeout(() => setFlash(null), 900);
      return () => clearTimeout(id);
    }
  }, [price]);

  return (
    <span
      className={
        flash === "up" ? "tl-flash-up rounded" : flash === "down" ? "tl-flash-down rounded" : ""
      }
    >
      {formatPrice(price)}
    </span>
  );
}
