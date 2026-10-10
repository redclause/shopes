import { auth } from "../../../auth";
import { redirect } from "next/navigation";
import AuditClient from "./AuditClient";

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

  return <AuditClient />;
}
