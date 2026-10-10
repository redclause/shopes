export type BacklinkSiteCategory =
  | "Community"
  | "Forum"
  | "Developer"
  | "Publishing"
  | "Directory"
  | "Reviews"
  | "Startup"
  | "Social";

export type BacklinkSite = {
  id: string;
  name: string;
  domain: string;
  category: BacklinkSiteCategory;
  url: string;
  submissionMethod: "Profile" | "Community post" | "Editorial pitch" | "Directory listing" | "Repository/project page" | "User review" | "Manual review";
  policyStatus: "review-required";
  notes: string;
};

/**
 * Curated discovery seed. Entries are opportunities to investigate, NOT a claim
 * that links are accepted or that submissions are allowed. Review each site's
 * current rules before any outreach. Extend this list only with real, sourced
 * websites and policy-review metadata.
 */
export const backlinkSiteCatalog: BacklinkSite[] = [
  { id: "reddit", name: "Reddit", domain: "reddit.com", category: "Community", url: "https://www.reddit.com/", submissionMethod: "Community post", policyStatus: "review-required", notes: "Share only where relevant and allowed by the subreddit rules." },
  { id: "quora", name: "Quora", domain: "quora.com", category: "Community", url: "https://www.quora.com/", submissionMethod: "Community post", policyStatus: "review-required", notes: "Answer questions substantively; avoid promotional or repetitive answers." },
  { id: "facebook", name: "Facebook", domain: "facebook.com", category: "Social", url: "https://www.facebook.com/", submissionMethod: "Community post", policyStatus: "review-required", notes: "Group and page rules vary; account access may be required." },
  { id: "linkedin", name: "LinkedIn", domain: "linkedin.com", category: "Social", url: "https://www.linkedin.com/", submissionMethod: "Profile", policyStatus: "review-required", notes: "Review profile and post link policies." },
  { id: "pinterest", name: "Pinterest", domain: "pinterest.com", category: "Social", url: "https://www.pinterest.com/", submissionMethod: "Profile", policyStatus: "review-required", notes: "Use accurate descriptions and non-spammy pins." },
  { id: "github", name: "GitHub", domain: "github.com", category: "Developer", url: "https://github.com/", submissionMethod: "Repository/project page", policyStatus: "review-required", notes: "Only create a genuinely useful project or resource; no link-only repositories." },
  { id: "gitlab", name: "GitLab", domain: "gitlab.com", category: "Developer", url: "https://gitlab.com/", submissionMethod: "Repository/project page", policyStatus: "review-required", notes: "Project pages must comply with platform rules." },
  { id: "stackoverflow", name: "Stack Overflow", domain: "stackoverflow.com", category: "Forum", url: "https://stackoverflow.com/", submissionMethod: "Community post", policyStatus: "review-required", notes: "Links must directly support a useful technical answer." },
  { id: "stackexchange", name: "Stack Exchange", domain: "stackexchange.com", category: "Forum", url: "https://stackexchange.com/", submissionMethod: "Community post", policyStatus: "review-required", notes: "Each community has its own scope and self-promotion rules." },
  { id: "hackernews", name: "Hacker News", domain: "news.ycombinator.com", category: "Community", url: "https://news.ycombinator.com/", submissionMethod: "Community post", policyStatus: "review-required", notes: "Submit only genuinely relevant launches or discussions." },
  { id: "indiehackers", name: "Indie Hackers", domain: "indiehackers.com", category: "Startup", url: "https://www.indiehackers.com/", submissionMethod: "Community post", policyStatus: "review-required", notes: "Check current community and promotion rules." },
  { id: "producthunt", name: "Product Hunt", domain: "producthunt.com", category: "Startup", url: "https://www.producthunt.com/", submissionMethod: "Directory listing", policyStatus: "review-required", notes: "Suitable for a real product launch, not generic backlink placement." },
  { id: "devto", name: "DEV Community", domain: "dev.to", category: "Publishing", url: "https://dev.to/", submissionMethod: "Community post", policyStatus: "review-required", notes: "Publish original, useful material and follow community guidelines." },
  { id: "hashnode", name: "Hashnode", domain: "hashnode.com", category: "Publishing", url: "https://hashnode.com/", submissionMethod: "Community post", policyStatus: "review-required", notes: "Best suited to original technical publishing." },
  { id: "medium", name: "Medium", domain: "medium.com", category: "Publishing", url: "https://medium.com/", submissionMethod: "Editorial pitch", policyStatus: "review-required", notes: "Review publication rules and disclose promotional relationships." },
  { id: "wordpress", name: "WordPress.com", domain: "wordpress.com", category: "Publishing", url: "https://wordpress.com/", submissionMethod: "Profile", policyStatus: "review-required", notes: "A profile or blog is not an endorsement or guaranteed backlink." },
  { id: "blogger", name: "Blogger", domain: "blogger.com", category: "Publishing", url: "https://www.blogger.com/", submissionMethod: "Profile", policyStatus: "review-required", notes: "Use only for a genuine publication, not generated link pages." },
  { id: "tumblr", name: "Tumblr", domain: "tumblr.com", category: "Publishing", url: "https://www.tumblr.com/", submissionMethod: "Profile", policyStatus: "review-required", notes: "Follow current community and content policies." },
  { id: "substack", name: "Substack", domain: "substack.com", category: "Publishing", url: "https://substack.com/", submissionMethod: "Profile", policyStatus: "review-required", notes: "Use for legitimate newsletter publishing." },
  { id: "sourceforge", name: "SourceForge", domain: "sourceforge.net", category: "Developer", url: "https://sourceforge.net/", submissionMethod: "Repository/project page", policyStatus: "review-required", notes: "Relevant primarily to software projects." },
  { id: "alternativeto", name: "AlternativeTo", domain: "alternativeto.net", category: "Directory", url: "https://alternativeto.net/", submissionMethod: "Directory listing", policyStatus: "review-required", notes: "Only list an actual software alternative that fits the directory." },
  { id: "saashub", name: "SaaSHub", domain: "saashub.com", category: "Directory", url: "https://www.saashub.com/", submissionMethod: "Directory listing", policyStatus: "review-required", notes: "Check product eligibility and current listing process." },
  { id: "betalist", name: "BetaList", domain: "betalist.com", category: "Startup", url: "https://betalist.com/", submissionMethod: "Directory listing", policyStatus: "review-required", notes: "For eligible early-stage products; review submission criteria." },
  { id: "f6s", name: "F6S", domain: "f6s.com", category: "Startup", url: "https://www.f6s.com/", submissionMethod: "Profile", policyStatus: "review-required", notes: "Use accurate company and program information." },
  { id: "wellfound", name: "Wellfound", domain: "wellfound.com", category: "Startup", url: "https://wellfound.com/", submissionMethod: "Profile", policyStatus: "review-required", notes: "Profiles should represent real companies and roles." },
  { id: "crunchbase", name: "Crunchbase", domain: "crunchbase.com", category: "Directory", url: "https://www.crunchbase.com/", submissionMethod: "Profile", policyStatus: "review-required", notes: "Check data submission and verification requirements." },
  { id: "g2", name: "G2", domain: "g2.com", category: "Reviews", url: "https://www.g2.com/", submissionMethod: "Directory listing", policyStatus: "review-required", notes: "Product listings and reviews must be genuine." },
  { id: "capterra", name: "Capterra", domain: "capterra.com", category: "Reviews", url: "https://www.capterra.com/", submissionMethod: "Directory listing", policyStatus: "review-required", notes: "Check category fit and vendor listing conditions." },
  { id: "trustpilot", name: "Trustpilot", domain: "trustpilot.com", category: "Reviews", url: "https://www.trustpilot.com/", submissionMethod: "User review", policyStatus: "review-required", notes: "Do not create fake reviews or reviews in exchange for links." },
  { id: "slashdot", name: "Slashdot", domain: "slashdot.org", category: "Community", url: "https://slashdot.org/", submissionMethod: "Community post", policyStatus: "review-required", notes: "Use the appropriate editorial submission process." },
  { id: "dzone", name: "DZone", domain: "dzone.com", category: "Publishing", url: "https://dzone.com/", submissionMethod: "Editorial pitch", policyStatus: "review-required", notes: "Check contributor requirements and editorial standards." },
  { id: "sitepoint", name: "SitePoint", domain: "sitepoint.com", category: "Publishing", url: "https://www.sitepoint.com/", submissionMethod: "Editorial pitch", policyStatus: "review-required", notes: "Pitch original material that matches editorial scope." },
  { id: "instructables", name: "Instructables", domain: "instructables.com", category: "Community", url: "https://www.instructables.com/", submissionMethod: "Community post", policyStatus: "review-required", notes: "Share a real instructional project, not a link-only post." },
  { id: "thingiverse", name: "Thingiverse", domain: "thingiverse.com", category: "Community", url: "https://www.thingiverse.com/", submissionMethod: "Profile", policyStatus: "review-required", notes: "Relevant to genuine 3D-printable designs." },
  { id: "behance", name: "Behance", domain: "behance.net", category: "Social", url: "https://www.behance.net/", submissionMethod: "Profile", policyStatus: "review-required", notes: "Use a portfolio with real creative work." },
  { id: "dribbble", name: "Dribbble", domain: "dribbble.com", category: "Social", url: "https://dribbble.com/", submissionMethod: "Profile", policyStatus: "review-required", notes: "Use genuine design work and a relevant portfolio link." },
  { id: "aboutme", name: "About.me", domain: "about.me", category: "Social", url: "https://about.me/", submissionMethod: "Profile", policyStatus: "review-required", notes: "Personal profile availability and link rules may change." },
  { id: "disqus", name: "Disqus", domain: "disqus.com", category: "Community", url: "https://disqus.com/", submissionMethod: "Profile", policyStatus: "review-required", notes: "Avoid promotional comments; use only where discussion is relevant." },
  { id: "openstreetmap", name: "OpenStreetMap", domain: "openstreetmap.org", category: "Community", url: "https://www.openstreetmap.org/", submissionMethod: "Manual review", policyStatus: "review-required", notes: "Not a general backlink directory; contribute only valid map data." },
  { id: "wikipedia", name: "Wikipedia", domain: "wikipedia.org", category: "Community", url: "https://www.wikipedia.org/", submissionMethod: "Manual review", policyStatus: "review-required", notes: "Only add links when they meet encyclopedia sourcing rules; never for SEO." }
];

export const backlinkSiteCategories = ["All", "Community", "Forum", "Developer", "Publishing", "Directory", "Reviews", "Startup", "Social"] as const;
