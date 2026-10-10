import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  // Use the real production origin by default so canonical URLs never point at localhost.
  // Set NEXT_PUBLIC_APP_URL explicitly for local development or an intentionally separate deployment.
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://shopes.online"),
  title: { default: "Shopes — Make your store discoverable everywhere", template: "%s | Shopes" },
  description: "Technical SEO audits, keyword intelligence, and product discovery tools built for online stores.",
  applicationName: "Shopes",
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
