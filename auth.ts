import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";

const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
const clientSecret =
  process.env.CLIENT_SECRET_ID_GOOGLE?.trim() ||
  process.env.GOOGLE_CLIENT_SECRET_ID?.trim() ||
  process.env.GOOGLE_CLIENT_SECRET?.trim();

type GoogleIdTokenClaims = {
  iss?: string;
  aud?: string | string[];
  sub?: string;
  email?: string;
  email_verified?: boolean | string;
  name?: string;
  picture?: string;
  exp?: number;
  iat?: number;
  nonce?: string;
};

function decodeBase64Url(value: string): Uint8Array {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
  return Uint8Array.from(atob(padded), (character) => character.charCodeAt(0));
}

function decodeJsonPart<T>(value: string): T {
  return JSON.parse(new TextDecoder().decode(decodeBase64Url(value))) as T;
}

function getCookie(request: Request, name: string): string | undefined {
  const cookieHeader = request.headers.get("cookie") || "";
  for (const part of cookieHeader.split(";")) {
    const separator = part.indexOf("=");
    if (separator < 0) continue;
    if (part.slice(0, separator).trim() === name) {
      return decodeURIComponent(part.slice(separator + 1).trim());
    }
  }
  return undefined;
}

async function verifyGoogleOneTapCredential(
  credential: unknown,
  request: Request,
) {
  if (
    typeof credential !== "string" ||
    credential.length > 12_000 ||
    credential.split(".").length !== 3 ||
    !clientId
  ) {
    return null;
  }

  try {
    const [encodedHeader, encodedPayload, encodedSignature] = credential.split(".");
    const header = decodeJsonPart<{ alg?: string; kid?: string }>(encodedHeader);
    const claims = decodeJsonPart<GoogleIdTokenClaims>(encodedPayload);
    if (header.alg !== "RS256" || !header.kid) return null;

    const response = await fetch("https://www.googleapis.com/oauth2/v3/certs", {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    if (!response.ok) return null;
    const keySet = (await response.json()) as {
      keys?: Array<JsonWebKey & { kid?: string; alg?: string; use?: string }>;
    };
    const key = keySet.keys?.find(
      (candidate) => candidate.kid === header.kid && candidate.use === "sig",
    );
    if (!key) return null;

    const publicKey = await crypto.subtle.importKey(
      "jwk",
      key,
      { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
      false,
      ["verify"],
    );
    const signedContent = new TextEncoder().encode(
      encodedHeader + "." + encodedPayload,
    );
    const signatureValid = await crypto.subtle.verify(
      "RSASSA-PKCS1-v1_5",
      publicKey,
      decodeBase64Url(encodedSignature),
      signedContent,
    );
    if (!signatureValid) return null;

    const now = Math.floor(Date.now() / 1000);
    const audienceMatches = Array.isArray(claims.aud)
      ? claims.aud.includes(clientId)
      : claims.aud === clientId;
    const nonce = getCookie(request, "shopes_google_one_tap_nonce");
    const emailVerified =
      claims.email_verified === true || claims.email_verified === "true";

    if (
      !["accounts.google.com", "https://accounts.google.com"].includes(claims.iss || "") ||
      !audienceMatches ||
      !claims.sub ||
      !claims.email ||
      !emailVerified ||
      !claims.exp ||
      claims.exp <= now ||
      !claims.iat ||
      claims.iat > now + 60 ||
      now - claims.iat > 600 ||
      !nonce ||
      !claims.nonce ||
      claims.nonce !== nonce
    ) {
      return null;
    }

    return {
      id: claims.sub,
      email: claims.email,
      name: claims.name || claims.email.split("@")[0],
      image: claims.picture,
    };
  } catch {
    return null;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId,
      clientSecret,
    }),
    Credentials({
      id: "google-one-tap",
      name: "Google One Tap",
      credentials: {
        credential: { label: "Google ID token", type: "text" },
      },
      async authorize(credentials, request) {
        return verifyGoogleOneTapCredential(credentials?.credential, request);
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  trustHost: true,
  pages: {
    signIn: "/login",
  },
});
