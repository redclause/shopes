import type { Metadata } from "next";
import { auth, signOut } from "../../auth";

export const metadata: Metadata = {
  title: "E-commerce SEO Tools & Product Discovery",
  description: "Audit your online store, uncover technical SEO issues, research keywords, and improve product discoverability with Shopes.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "https://shopes.online/",
    title: "E-commerce SEO Tools & Product Discovery | Shopes",
    description: "Audit your online store, uncover technical SEO issues, research keywords, and improve product discoverability."
  },
  twitter: {
    card: "summary",
    title: "E-commerce SEO Tools & Product Discovery | Shopes",
    description: "Audit your online store, uncover technical SEO issues, research keywords, and improve product discoverability."
  }
};
import HomeClient from "./HomeClient";

export default async function HomePage() {
  const session = await auth();
  const user = session?.user;

  async function signOutAction() {
    "use server";
    await signOut({ redirectTo: "/" });
  }

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://shopes.online/#organization",
        name: "Shopes",
        url: "https://shopes.online/"
      },
      {
        "@type": "WebSite",
        "@id": "https://shopes.online/#website",
        name: "Shopes",
        url: "https://shopes.online/",
        description: "E-commerce SEO tools and product discovery intelligence for online stores.",
        publisher: { "@id": "https://shopes.online/#organization" },
        inLanguage: "en"
      }
    ]
  };

  return (
    <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
    <HomeClient
      user={user ? {
        name: user.name ?? user.email ?? "Shopes user",
        email: user.email ?? "",
        image: user.image
      } : null}
      signOutAction={user ? signOutAction : undefined}
    />
    </>
  );
}
