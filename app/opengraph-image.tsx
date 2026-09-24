import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#08090c",
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            fontSize: 72,
            fontWeight: 800,
            fontFamily: "monospace",
            color: "#eef1ee",
          }}
        >
          <span style={{ color: "#ff2d2d" }}>{">"}</span>
          <span>
            TRADING<span style={{ color: "#ff2d2d" }}>LEGENDS</span>
          </span>
        </div>
        <div
          style={{
            marginTop: 24,
            fontSize: 28,
            fontFamily: "monospace",
            color: "#93998f",
          }}
        >
          Live crypto market data. Whale tracking. Automated alerts.
        </div>
      </div>
    ),
    { ...size }
  );
}
