import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://shopes.online"),
  title: { default: "Shopes — E-commerce SEO & Product Discovery", template: "%s | Shopes" },
  description: "Improve your online store's discoverability with technical SEO audits, keyword research, product data checks, and e-commerce search intelligence.",
  applicationName: "Shopes",
  robots: { index: true, follow: true }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" dir="ltr"><body>{children}</body></html>;
}
