import type { Metadata } from "next";
import { auth, signOut } from "../../../auth";
import { redirect } from "next/navigation";
import KeywordResearchClient from "./KeywordResearchClient";
export const metadata: Metadata = {
  title: "Keyword Research",
  description: "Authenticated Shopes keyword research workspace.",
  robots: { index: false, follow: false },
};


export default async function KeywordResearchPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=%2Fkeyword-research");
  async function signOutAction() {
    "use server";
    await signOut({ redirectTo: "/" });
  }
  const user = session.user;
  return <KeywordResearchClient userName={user.name?.trim() || user.email?.split("@")[0] || "Shopes user"} userEmail={user.email || ""} userImage={user.image} signOutAction={signOutAction} />;
}
