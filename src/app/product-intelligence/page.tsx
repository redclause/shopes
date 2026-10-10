import type { Metadata } from "next";
import { auth } from "../../../auth";
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
  return <ProductIntelligenceClient />;
}
