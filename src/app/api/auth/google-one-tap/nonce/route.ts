import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const nonce = crypto.randomUUID();
  const response = NextResponse.json({ nonce }, {
    headers: { "Cache-Control": "no-store, max-age=0" },
  });
  response.cookies.set("shopes_google_one_tap_nonce", nonce, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 300,
  });
  return response;
}
