import { auth } from "../../../auth";
import { redirect } from "next/navigation";
import AuditClient from "./AuditClient";

export default async function AuditPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=%2Faudit");
  return <AuditClient />;
}
