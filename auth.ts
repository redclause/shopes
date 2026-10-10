import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret =
  process.env.GOOGLE_CLIENT_SECRET_ID ?? process.env.GOOGLE_CLIENT_SECRET;

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
