import type { Metadata } from "next";
import { auth, signOut } from "../../../auth";
import { redirect } from "next/navigation";
import ProductIntelligenceClient from "./ProductIntelligenceClient";

export const metadata: Metadata = {
  title: "Product Intelligence",
  description: "Evidence-based product page and catalog optimization checks.",
  robots: { index: false, follow: false },
};

export default async function ProductIntelligencePage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=%2Fproduct-intelligence");
  async function signOutAction() {\n    "use server";\n    await signOut({ redirectTo: "/" });\n  }\n  const user = session.user;\n  return <ProductIntelligenceClient userName={user.name?.trim() || user.email?.split("@")[0] || "Shopes user"} userEmail={user.email || ""} userImage={user.image} signOutAction={signOutAction} />;
}
