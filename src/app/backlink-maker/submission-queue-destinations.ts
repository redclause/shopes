export type SubmissionQueueKind = "search-engine" | "directory-backlink";

export type SubmissionQueueDestination = {
  id: string;
  name: string;
  kind: SubmissionQueueKind;
  url: string;
  method: string;
  guidance: string;
  requirements: string;
};

/**
 * Small starter set of official destination URLs. These are verified official
 * workflows, not a guarantee that any target site will accept or publish a link.
 * Shopes opens them for user-assisted submission; it does not automate external forms.
 */
export const submissionQueueDestinations: SubmissionQueueDestination[] = [
  {
    id: "google-search-console",
    name: "Google Search Console",
    kind: "search-engine",
    url: "https://search.google.com/search-console",
    method: "Sitemap submission / URL inspection",
    guidance: "Use the Sitemaps report for site discovery or URL Inspection to request indexing for an eligible page.",
    requirements: "You must own or verify the website property. Google does not guarantee indexing.",
  },
  {
    id: "bing-webmaster-tools",
    name: "Bing Webmaster Tools",
    kind: "search-engine",
    url: "https://www.bing.com/webmasters/",
    method: "Sitemap / URL submission",
    guidance: "Verify the website, then use the available sitemap or URL submission tools.",
    requirements: "Website verification and account access are required. Submission does not guarantee indexing.",
  },
  {
    id: "indexnow-setup",
    name: "IndexNow setup guide",
    kind: "search-engine",
    url: "https://www.bing.com/indexnow/",
    method: "Owner-authorized URL notification",
    guidance: "Follow the official setup guide to create and host a domain key before notifying participating search engines.",
    requirements: "Only submit URLs on a domain you control and after hosting the required key file.",
  },
  {
    id: "github-project",
    name: "GitHub project",
    kind: "directory-backlink",
    url: "https://github.com/new",
    method: "Repository / project page",
    guidance: "Create a genuinely useful public project or resource only when GitHub is relevant to what you are publishing.",
    requirements: "A GitHub account is required. Do not create a link-only or misleading repository.",
  },
  {
    id: "dev-community",
    name: "DEV Community",
    kind: "directory-backlink",
    url: "https://dev.to/new",
    method: "Original article",
    guidance: "Publish an original, useful article and include your URL only when it adds genuine context.",
    requirements: "An account and compliance with current community rules are required.",
  },
  {
    id: "reddit-post",
    name: "Reddit",
    kind: "directory-backlink",
    url: "https://www.reddit.com/submit",
    method: "Community post",
    guidance: "Choose a relevant community and review its rules before posting. Share only where promotion is allowed.",
    requirements: "Account access and compliance with each community's rules are required.",
  },
  {
    id: "product-hunt",
    name: "Product Hunt",
    kind: "directory-backlink",
    url: "https://www.producthunt.com/launch",
    method: "Product launch",
    guidance: "Use only for a real product launch that fits Product Hunt; this is not a generic backlink directory.",
    requirements: "Review current launch eligibility and platform guidelines before submitting.",
  },
];
