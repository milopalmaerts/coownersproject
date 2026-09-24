import { notFound } from "next/navigation";
import { marketProvider } from "@/lib/providers";
import { UnknownAssetError } from "@/lib/errors";
import { LivePrice } from "@/components/dashboard/LivePrice";
import { LivePctBadge } from "@/components/dashboard/LivePctBadge";

// A tiny, embeddable ticker for other sites to <iframe> in — no nav, no
// sidebar, no auth, just a live price. Publicly readable by design (it's
// meant to be embedded elsewhere), same data as the rest of the site.
export default async function EmbedTickerPage({
  params,
}: {
  params: Promise<{ symbol: string }>;
}) {
  const { symbol } = await params;

  let ticker;
  try {
    ticker = await marketProvider.getTicker(symbol);
  } catch (err) {
    if (err instanceof UnknownAssetError) notFound();
    throw err;
  }

  const siteHost = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://coownersproject.vercel.app").replace(
    /\/$/,
    ""
  );

  return (
    <div
      className="tl-mono"
      style={{ margin: 0, background: "#08090c", color: "#eef1ee", fontFamily: "monospace" }}
    >
      <a
        href={`${siteHost}/markets/${ticker.symbol}`}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          padding: "10px 14px",
          textDecoration: "none",
          color: "inherit",
          border: "1px solid #22262e",
          borderRadius: 8,
          boxSizing: "border-box",
          width: "100%",
          height: "100%",
        }}
      >
        <div>
          <div style={{ fontSize: 11, color: "#565d54" }}>{ticker.name}</div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>{ticker.symbol}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 18, fontWeight: 700 }}>
            <LivePrice initial={ticker} />
          </div>
          <LivePctBadge initial={ticker} />
        </div>
      </a>
      <div style={{ fontSize: 9, color: "#565d54", textAlign: "center", padding: "2px 0" }}>
        via TradingLegends
      </div>
    </div>
  );
}
