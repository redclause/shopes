import { auth, signOut } from "../../../auth";
import { redirect } from "next/navigation";
import BacklinkMakerClient from "./BacklinkMakerClient";

export default async function BacklinkMakerPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=%2Fbacklink-maker");
  async function signOutAction() { "use server"; await signOut({ redirectTo: "/" }); }
  const user = session.user;
  return <BacklinkMakerClient userName={user.name?.trim() || user.email?.split("@")[0] || "Shopes user"} userEmail={user.email || ""} userImage={user.image} signOutAction={signOutAction} />;
}
