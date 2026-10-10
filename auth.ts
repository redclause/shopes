import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
const clientSecret =
  process.env.CLIENT_SECRET_ID_GOOGLE?.trim() ||
  process.env.GOOGLE_CLIENT_SECRET_ID?.trim() ||
  process.env.GOOGLE_CLIENT_SECRET?.trim();

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
