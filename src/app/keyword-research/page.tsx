import { auth, signOut } from "../../../auth";
import { redirect } from "next/navigation";
import KeywordResearchClient from "./KeywordResearchClient";

export default async function KeywordResearchPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=%2Fkeyword-research");
  async function signOutAction() {\n    "use server";\n    await signOut({ redirectTo: "/" });\n  }\n  const user = session.user;\n  return <KeywordResearchClient userName={user.name?.trim() || user.email?.split("@")[0] || "Shopes user"} userEmail={user.email || ""} userImage={user.image} signOutAction={signOutAction} />;
}
