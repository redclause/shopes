import type { Metadata } from "next";
import { auth, signOut } from "../../auth";
import HomeClient from "./HomeClient";

const SITE_URL = "https://shopes.online";
const HOMEPAGE_DESCRIPTION =
  "Audit your online store, uncover technical SEO issues, research keywords, and improve product discoverability with Shopes.";

export const metadata: Metadata = {
  title: "E-commerce SEO Tools & Product Discovery",
  description: HOMEPAGE_DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: SITE_URL,
    title: "E-commerce SEO Tools & Product Discovery | Shopes",
    description: HOMEPAGE_DESCRIPTION
  },
  twitter: {
    card: "summary",
    title: "E-commerce SEO Tools & Product Discovery | Shopes",
    description: HOMEPAGE_DESCRIPTION
  }
};

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
        "@id": `${SITE_URL}/#organization`,
        name: "Shopes",
        url: `${SITE_URL}/`
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        name: "Shopes",
        url: `${SITE_URL}/`,
        description:
          "E-commerce SEO tools and product discovery intelligence for online stores.",
        publisher: { "@id": `${SITE_URL}/#organization` },
        inLanguage: "en"
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c")
        }}
      />
      <HomeClient
        user={
          user
            ? {
                name: user.name ?? user.email ?? "Shopes user",
                email: user.email ?? "",
                image: user.image
              }
            : null
        }
        signOutAction={user ? signOutAction : undefined}
      />
    </>
  );
}
