import { auth, signOut } from "../../auth";
import HomeClient from "./HomeClient";

export default async function HomePage() {
  const session = await auth();
  const user = session?.user;

  async function signOutAction() {
    "use server";
    await signOut({ redirectTo: "/" });
  }

  if (!user) return <HomeClient />;

  return (
    <HomeClient
      user={{
        name: user.name?.trim() || user.email?.split("@")[0] || "Shopes user",
        email: user.email || "",
        image: user.image,
      }}
      signOutAction={signOutAction}
    />
  );
}
