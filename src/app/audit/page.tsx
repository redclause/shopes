import type { Metadata } from "next";
import { auth, signOut } from "../../../auth";
import { redirect } from "next/navigation";
import AuditClient from "./AuditClient";
export const metadata: Metadata = {
  title: "Site Audit",
  description: "Authenticated Shopes site audit workspace.",
  robots: { index: false, follow: false },
};


type AuditPageProps = {
  searchParams: Promise<{ url?: string | string[] }>;
};

export default async function AuditPage({ searchParams }: AuditPageProps) {
  const params = await searchParams;
  const requestedUrl = typeof params.url === "string" ? params.url : "";
  const session = await auth();

  if (!session?.user) {
    const callbackUrl = requestedUrl
      ? "/audit?url=" + encodeURIComponent(requestedUrl)
      : "/audit";
    redirect("/login?callbackUrl=" + encodeURIComponent(callbackUrl));
  }

  async function signOutAction() {
    "use server";
    await signOut({ redirectTo: "/" });
  }

  const user = session.user;
  return <AuditClient userName={user.name?.trim() || user.email?.split("@")[0] || "Shopes user"} userEmail={user.email || ""} userImage={user.image} signOutAction={signOutAction} />;
}
