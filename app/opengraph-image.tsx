import { ImageResponse } from "next/og";

export const alt = "Venturo — Plan smarter trips in minutes";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Note: avoid non-Latin glyphs here — they'd trigger a dynamic font fetch.
export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "linear-gradient(135deg, #1B2A4A 0%, #24345c 100%)",
          color: "#FAF8F4",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 14,
              background: "#FF6B5E",
              marginRight: 18,
            }}
          />
          <div style={{ display: "flex", fontSize: 34, fontWeight: 600 }}>
            Venturo
          </div>
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 78,
            fontWeight: 800,
            lineHeight: 1.05,
            marginTop: 44,
          }}
        >
          Plan smarter trips in minutes.
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 32,
            marginTop: 28,
            color: "#cdd5e6",
          }}
        >
          Where to stay, what to do, where to eat — day by day.
        </div>
      </div>
    ),
    size,
  );
}
