import { NextRequest, NextResponse } from "next/server";

// Resuelve un shortlink de TikTok (vt.tiktok.com) siguiendo el redirect
// server-side y devuelve la URL final con el videoId embeddable.
export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  if (!url) return NextResponse.json({ error: "Missing url" }, { status: 400 });

  try {
    const res = await fetch(url, {
      redirect: "follow",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      },
    });
    return NextResponse.json({ resolvedUrl: res.url });
  } catch {
    return NextResponse.json({ error: "Failed to resolve" }, { status: 500 });
  }
}
