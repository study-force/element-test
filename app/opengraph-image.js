import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt = "엘리먼트 학습성향 4유형";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const fontData = await readFile(
    new URL("../fonts/SCDream6.woff", import.meta.url)
  );
  const ogImageSrc = await readFile(
    new URL("../public/og-image.png", import.meta.url)
  );
  const ogImageBase64 = `data:image/png;base64,${ogImageSrc.toString("base64")}`;

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
          background: "white",
          fontFamily: "SCDream",
        }}
      >
        <div
          style={{
            fontSize: 48,
            fontWeight: 600,
            color: "#1A1A1A",
            marginBottom: 16,
            letterSpacing: "-0.5px",
          }}
        >
          나의 공부 스타일은 어떤 유형일까?
        </div>
        <img
          src={ogImageBase64}
          width={880}
          height={430}
          style={{ objectFit: "contain" }}
        />
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "SCDream",
          data: fontData,
          style: "normal",
          weight: 600,
        },
      ],
    }
  );
}
