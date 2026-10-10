import { auth } from "../../../auth";
import { redirect } from "next/navigation";
import KeywordResearchClient from "./KeywordResearchClient";

export default async function KeywordResearchPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=%2Fkeyword-research");
  return <KeywordResearchClient />;
}
