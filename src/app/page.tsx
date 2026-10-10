import { auth, signOut } from "../../auth";
import HomeClient from "./HomeClient";

export default async function HomePage() {
  const session = await auth();
  const user = session?.user;

  async function signOutAction() {
    "use server";
    await signOut({ redirectTo: "/" });
  }

  return (
    <HomeClient
      user={user ? {
        name: user.name ?? user.email ?? "Shopes user",
        email: user.email ?? "",
        image: user.image
      } : null}
      signOutAction={user ? signOutAction : undefined}
    />
  );
}
