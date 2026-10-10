import { NextResponse } from "next/server";

// TEMPORARY diagnostic for the beta deployment.
// Exposes presence flags only; never returns credential values.
// Remove this route after OAuth configuration is verified.
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecretId = process.env.GOOGLE_CLIENT_SECRET_ID;
  const clientSecretFallback = process.env.GOOGLE_CLIENT_SECRET;

  return NextResponse.json(
    {
      diagnostic: "oauth-config-presence",
      googleClientIdPresent: Boolean(clientId?.trim()),
      googleClientSecretIdPresent: Boolean(clientSecretId?.trim()),
      googleClientSecretFallbackPresent: Boolean(clientSecretFallback?.trim()),
      resolvedClientSecretPresent: Boolean(
        (clientSecretId ?? clientSecretFallback)?.trim(),
      ),
      authSecretPresent: Boolean(process.env.AUTH_SECRET?.trim()),
    },
    {
      headers: {
        "Cache-Control": "no-store, max-age=0",
        "X-Robots-Tag": "noindex, nofollow",
      },
    },
  );
}
