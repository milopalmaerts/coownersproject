import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#08090c",
        }}
      >
        <span style={{ fontSize: 320, color: "#ff2d2d", fontFamily: "monospace" }}>{">"}</span>
      </div>
    ),
    { ...size }
  );
}
