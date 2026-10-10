import { auth } from "../../../auth";
import { redirect } from "next/navigation";
import ProductIntelligenceClient from "./ProductIntelligenceClient";

export default async function ProductIntelligencePage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=%2Fproduct-intelligence");
  return <ProductIntelligenceClient />;
}
