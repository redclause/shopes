import type { Metadata } from "next";
import "./globals.css";
import LocaleSwitcher from "../lib/i18n/LocaleSwitcher";
import { cookies } from "next/headers";
import { getLocale, getDirection, LOCALE_STORAGE_KEY } from "../lib/i18n/languages";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: { default: "Shopes — Make your store discoverable everywhere", template: "%s | Shopes" },
  description: "Technical SEO audits, keyword intelligence, and product discovery tools built for online stores.",
  applicationName: "Shopes",
  robots: { index: true, follow: true }
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const cookieStore = await cookies();
  const locale = getLocale(cookieStore.get(LOCALE_STORAGE_KEY)?.value);
  return <html lang={locale.code} dir={getDirection(locale.code)}><body>{children}<LocaleSwitcher /></body></html>;
}
