"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

const BOOT_LINES = [
  "TRADINGLEGENDS TERMINAL // v0.1",
  "BOOT SEQUENCE INITIATED ...",
  "> loading market feeds ............ OK",
  "> linking exchanges [COINGECKO·BINANCE·HYPERLIQUID] ... OK",
  "> calibrating whale + alert engine .... OK",
  "> scanning 8 tracked assets / 7 timeframes ..... OK",
];

// A terminal-style boot animation that types/reveals each line in sequence
// with GSAP, then reveals the headline — the same "booting up" feel as a
// trading-terminal product page, built without any external assets.
export function BootSequence({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const lineRefs = useRef<(HTMLDivElement | null)[]>([]);
  const headlineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

      lineRefs.current.forEach((el, i) => {
        if (!el) return;
        tl.fromTo(
          el,
          { opacity: 0, y: 6 },
          { opacity: 1, y: 0, duration: 0.25 },
          i === 0 ? 0 : "+=0.08"
        );
      });

      if (headlineRef.current) {
        tl.fromTo(
          headlineRef.current,
          { opacity: 0, y: 24 },
          { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" },
          "+=0.15"
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef}>
      <div className="tl-window rounded-lg max-w-xl mx-auto mb-10">
        <div className="tl-window-bar rounded-t-lg">
          <span className="tl-window-dot" />
          <span className="tl-window-dot" />
          <span className="tl-window-dot" />
          <span className="ml-2">boot.sh</span>
        </div>
        <div className="p-4 tl-mono text-xs sm:text-sm space-y-1 text-left">
          {BOOT_LINES.map((line, i) => (
            <div
              key={line}
              ref={(el) => {
                lineRefs.current[i] = el;
              }}
              className={
                i === 0
                  ? "text-tl-accent"
                  : i === 1
                    ? "text-tl-text-secondary"
                    : "text-tl-text-secondary"
              }
              style={{ opacity: 0 }}
            >
              {line}
            </div>
          ))}
        </div>
      </div>
      <div ref={headlineRef} style={{ opacity: 0 }}>
        {children}
      </div>
    </div>
  );
}
