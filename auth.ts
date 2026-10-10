import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret =
  process.env.GOOGLE_CLIENT_SECRET_ID ?? process.env.GOOGLE_CLIENT_SECRET;

// Temporary server-side diagnostic: report presence only, never credential data.
if (typeof window === "undefined") {
  console.info("[oauth-config-diagnostic]", {
    googleClientIdPresent: Boolean(clientId?.trim()),
    googleClientSecretIdPresent: Boolean(
      process.env.GOOGLE_CLIENT_SECRET_ID?.trim(),
    ),
    googleClientSecretFallbackPresent: Boolean(
      process.env.GOOGLE_CLIENT_SECRET?.trim(),
    ),
    resolvedClientSecretPresent: Boolean(clientSecret?.trim()),
  });
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId,
      clientSecret,
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
