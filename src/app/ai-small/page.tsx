import type { Metadata } from "next";
import SmolLM2Workspace from "./SmolLM2Workspace";

export const metadata: Metadata = {
  title: "Free SEO Snippet Preview Tool",
  description: "Preview SEO titles, meta descriptions, URLs, and focus keyword placement with a free browser-based Shopes tool.",
  robots: { index: false, follow: false },
};

export default function SeoPreviewPage() {
  return <SmolLM2Workspace />;
}
