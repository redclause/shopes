import { signOut, auth } from "../../../auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, LogOut, ShoppingBag } from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login?callbackUrl=%2Fdashboard");
  }

  async function signOutAction() {
    "use server";
    await signOut({ redirectTo: "/" });
  }

  return (
    <main style={{ minHeight: "100vh", background: "#f7faf7", color: "#19251f", fontFamily: '"DM Sans", Arial, sans-serif', padding: 24 }}>
      <header style={{ maxWidth: 960, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, padding: "16px 0", borderBottom: "1px solid #e3eae2" }}>
        <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 9, fontWeight: 800, fontSize: 22, color: "inherit", textDecoration: "none" }}>
          <span style={{ width: 32, height: 32, display: "grid", placeItems: "center", background: "#a6e9c7", borderRadius: 10, color: "#173c2b" }}><ShoppingBag size={17} /></span>
          <span>shopes<span style={{ color: "#5db88b" }}>.</span></span>
        </Link>
        <form action={signOutAction}>
          <button type="submit" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 14px", border: "1px solid #dce4dc", borderRadius: 10, background: "#fff", color: "#202923", fontWeight: 700, cursor: "pointer" }}><LogOut size={15} /> Sign out</button>
        </form>
      </header>
      <section style={{ maxWidth: 960, margin: "64px auto 0", padding: 32, border: "1px solid #e3eae2", borderRadius: 20, background: "#fff" }}>
        <p style={{ color: "#5e6b64", fontSize: 11, letterSpacing: ".14em", fontWeight: 800 }}>YOUR SHOPES WORKSPACE</p>
        <h1 style={{ margin: "12px 0", fontSize: 36, letterSpacing: "-.04em" }}>Welcome{session.user.name ? `, ${session.user.name}` : ""}.</h1>
        <p style={{ color: "#69766e", lineHeight: 1.8 }}>You are signed in with Google. Workspace persistence and live SEO tools are not yet connected.</p>
        <Link href="/" style={{ marginTop: 20, display: "inline-flex", alignItems: "center", gap: 8, color: "#287d52", fontWeight: 700, textDecoration: "none" }}><ArrowLeft size={15} /> Back to Shopes</Link>
      </section>
    </main>
  );
}
