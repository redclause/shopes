import type { Metadata } from "next";
import Link from "next/link";
import { translate } from "../../lib/i18n/messages";
import { signIn } from "../../../auth";
import GoogleOneTapButton from "../components/GoogleOneTapButton";
import { ArrowLeft, ShieldCheck, ShoppingBag } from "lucide-react";
export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in securely to your Shopes account.",
  robots: { index: false, follow: false },
};


type LoginPageProps = {
  searchParams: Promise<{ callbackUrl?: string | string[] }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const t = (key: Parameters<typeof translate>[1]) => translate("en", key);
  const params = await searchParams;
  const requested = params.callbackUrl;
  const callbackUrl =
    typeof requested === "string" &&
    requested.startsWith("/") &&
    !requested.startsWith("//") &&
    !requested.startsWith("/\\")
      ? requested
      : "/dashboard";

  async function signInWithGoogle() {
    "use server";
    await signIn("google", { redirectTo: callbackUrl });
  }

  return (
    <main className="login-shell" style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, background: "#0B0D12", color: "#F4F7FB", fontFamily: '"DM Sans", Arial, sans-serif' }}>
      <section className="login-card" style={{ width: "100%", maxWidth: 420, padding: "38px 34px", border: "1px solid #293342", borderRadius: 18, background: "#11151C", boxShadow: "0 28px 80px #0008" }}>
        <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 9, fontWeight: 800, fontSize: 24, letterSpacing: "-1.3px", color: "inherit", textDecoration: "none" }}>
          <span style={{ width: 34, height: 34, display: "grid", placeItems: "center", background: "#49DDF5", borderRadius: 11, color: "#07131a" }}><ShoppingBag size={18} /></span>
          <span>shopes<span style={{ color: "#49DDF5" }}>.</span></span>
        </Link>
        <div style={{ marginTop: 38, width: 44, height: 44, borderRadius: 13, display: "grid", placeItems: "center", background: "#172d38", color: "#49DDF5" }}><ShieldCheck size={21} /></div>
        <p style={{ margin: "23px 0 10px", fontSize: 13, letterSpacing: ".08em", fontWeight: 800, color: "#B2BDCC" }}>YOUR SHOPES WORKSPACE</p>
        <h1 className="login-title" style={{ margin: "0 0 12px", fontSize: 40, lineHeight: 1.15, letterSpacing: "-.055em" }}>{t("signIn")}.</h1>
        <p className="login-description" style={{ margin: "0 0 26px", color: "#B2BDCC", fontSize: 17, lineHeight: 1.8 }}>{t("signIn")} securely with your Google account to access your workspace.</p>
        <GoogleOneTapButton className="google-signin-button" label="Continue with Google" redirectTo={callbackUrl} />
        <form action={signInWithGoogle} className="standard-google-fallback">
          <button type="submit">Use standard Google sign-in</button>
        </form>
        <p style={{ margin: "19px 0 0", fontSize: 13, lineHeight: 1.8, color: "#8997AA" }}>Your Google client secret stays on the server and is never exposed in the browser.</p>
        <Link href="/" style={{ marginTop: 28, display: "inline-flex", alignItems: "center", gap: 7, color: "#B2BDCC", fontSize: 14, fontWeight: 700, textDecoration: "none" }}><ArrowLeft size={14} /> {t("back")} to Shopes</Link>
      </section>
    </main>
  );
}

