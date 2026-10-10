import Link from "next/link";
import { signIn } from "../../../auth";
import { ArrowLeft, ShieldCheck, ShoppingBag } from "lucide-react";

type LoginPageProps = {
  searchParams: Promise<{ callbackUrl?: string | string[] }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const requested = params.callbackUrl;
  const callbackUrl =
    typeof requested === "string" && requested.startsWith("/") && !requested.startsWith("//")
      ? requested
      : "/dashboard";

  async function signInWithGoogle() {
    "use server";
    await signIn("google", { redirectTo: callbackUrl });
  }

  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, background: "radial-gradient(ellipse at 50% 15%, #e8f7ed, #f8faf7 58%, #f5f7f4)", color: "#19251f", fontFamily: '"DM Sans", Arial, sans-serif' }}>
      <section style={{ width: "100%", maxWidth: 420, padding: "38px 34px", border: "1px solid #e3eae2", borderRadius: 22, background: "#ffffffed", boxShadow: "0 28px 80px #1b35250f" }}>
        <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 9, fontWeight: 800, fontSize: 24, letterSpacing: "-1.3px", color: "inherit", textDecoration: "none" }}>
          <span style={{ width: 34, height: 34, display: "grid", placeItems: "center", background: "#a6e9c7", borderRadius: 11, color: "#173c2b" }}><ShoppingBag size={18} /></span>
          <span>shopes<span style={{ color: "#5db88b" }}>.</span></span>
        </Link>
        <div style={{ marginTop: 38, width: 44, height: 44, borderRadius: 13, display: "grid", placeItems: "center", background: "#e4f7eb", color: "#287d52" }}><ShieldCheck size={21} /></div>
        <p style={{ margin: "23px 0 10px", fontSize: 10, letterSpacing: ".14em", fontWeight: 800, color: "#5e6b64" }}>YOUR SHOPES WORKSPACE</p>
        <h1 style={{ margin: "0 0 12px", fontSize: 34, lineHeight: 1.15, letterSpacing: "-.055em" }}>Welcome back.</h1>
        <p style={{ margin: "0 0 26px", color: "#69766e", fontSize: 13, lineHeight: 1.8 }}>Sign in securely with your Google account to access your workspace.</p>
        <form action={signInWithGoogle}>
          <button type="submit" style={{ width: "100%", minHeight: 49, display: "flex", alignItems: "center", justifyContent: "center", gap: 11, border: "1px solid #dce4dc", borderRadius: 10, background: "#fff", color: "#202923", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
            <GoogleMark /> Continue with Google
          </button>
        </form>
        <p style={{ margin: "19px 0 0", fontSize: 10, lineHeight: 1.8, color: "#87938a" }}>Your Google client secret stays on the server and is never exposed in the browser.</p>
        <Link href="/" style={{ marginTop: 28, display: "inline-flex", alignItems: "center", gap: 7, color: "#4f6a58", fontSize: 11, fontWeight: 700, textDecoration: "none" }}><ArrowLeft size={14} /> Back to Shopes</Link>
      </section>
    </main>
  );
}

function GoogleMark() {
  return <svg aria-hidden="true" viewBox="0 0 48 48" width="19" height="19">
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.72 7.18l7.62 5.91c4.45-4.11 7.14-10.17 7.14-17.56Z" />
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.9-5.79l-7.62-5.91c-2.12 1.42-4.84 2.26-8.28 2.26-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48Z" />
    <path fill="#FBBC05" d="M10.53 28.59A14.4 14.4 0 0 1 9.75 24c0-1.59.27-3.13.76-4.59l-7.98-6.19A23.9 23.9 0 0 0 0 24c0 3.87.93 7.52 2.56 10.78l7.97-6.19Z" />
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z" />
  </svg>;
}
