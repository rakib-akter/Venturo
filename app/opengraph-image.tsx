import { ImageResponse } from "next/og";

export const alt = "Venturo — Plan smarter trips in minutes";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

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
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: "#FF6B5E",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 36,
            }}
          >
            ✦
          </div>
          <div style={{ fontSize: 32, fontWeight: 600 }}>Venturo</div>
        </div>
        <div
          style={{
            fontSize: 76,
            fontWeight: 800,
            lineHeight: 1.05,
            marginTop: 40,
          }}
        >
          Plan smarter trips
          <br />
          in minutes.
        </div>
        <div style={{ fontSize: 32, marginTop: 28, color: "#cdd5e6" }}>
          Where to stay · what to do · where to eat · day by day
        </div>
      </div>
    ),
    size,
  );
}
