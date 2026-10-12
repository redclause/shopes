import type { Metadata } from "next";
import SmolLM2Workspace from "./SmolLM2Workspace";

export const metadata: Metadata = {
  title: "SmolLM2 AI Lab",
  description: "Experiment with local browser-based SmolLM2 for e-commerce SEO and content planning.",
  robots: { index: false, follow: false },
};

export default function SmolLM2Page() {
  return <SmolLM2Workspace />;
}
