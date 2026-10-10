import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms for accessing Shopes and using its SEO tools and Backlink Maker."
};

const section: React.CSSProperties = { marginTop: 28 };
const paragraph: React.CSSProperties = { color: "#53635a", lineHeight: 1.85 };
const heading: React.CSSProperties = { fontSize: 19, marginBottom: 8, color: "#17231f" };

export default function TermsPage() {
  return <main style={{ maxWidth: 820, margin: "0 auto", padding: "48px 24px 72px", color: "#17231f" }}>
    <Link href="/" style={{ color: "#27865c", fontWeight: 700 }}>← Back to Shopes</Link>
    <p style={{ marginTop: 32, color: "#27865c", fontWeight: 800, letterSpacing: ".12em", fontSize: 11 }}>LEGAL</p>
    <h1 style={{ fontSize: "clamp(34px, 5vw, 48px)", letterSpacing: "-.05em", margin: "10px 0" }}>Terms of Service</h1>
    <p style={paragraph}>Last updated: October 11, 2026</p>
    <p style={paragraph}>These terms apply to your access to Shopes and its tools. By using the service, you agree to use it lawfully and in accordance with these terms. If you do not agree, do not use Shopes.</p>
    <section style={section}><h2 style={heading}>Permitted use</h2><p style={paragraph}>You may use Shopes for legitimate SEO research, product and website analysis, backlink opportunity research, and checking publicly accessible pages. You are responsible for the URLs, text, and other information you submit and for ensuring you have the rights and authority to use them.</p></section>
    <section style={section}><h2 style={heading}>Backlink Maker rules</h2><p style={paragraph}>You must review each destination website’s relevance, submission rules, and permissions. Do not send spam, irrelevant or deceptive content, fabricate accounts, evade CAPTCHA or anti-bot systems, bypass authentication or access controls, or disregard a website’s stated restrictions. Automated submission is available only where a specific workflow is technically supported and permitted. A catalog listing, detected form, successful request, or user-reported attempt is not proof of publication. Backlinks are considered verified only when the checker finds evidence of the target link on the checked page; results may change and are not a guarantee of search-engine ranking or SEO outcomes.</p></section>
    <section style={section}><h2 style={heading}>Accounts and security</h2><p style={paragraph}>Keep your account access secure and do not attempt to access other users’ accounts or data. We may limit or suspend access to protect Shopes, third parties, or the service from misuse, excessive traffic, security risks, or violations of these terms.</p></section>
    <section style={section}><h2 style={heading}>Third-party sites and results</h2><p style={paragraph}>Shopes may link to third-party sites or retrieve publicly accessible page information at your request. Third-party websites are independent and may change, block requests, require review, or remove content. Shopes does not control their availability or editorial decisions and cannot guarantee that any submission will be accepted, that a backlink will remain live, or that search engines will index or value a link.</p></section>
    <section style={section}><h2 style={heading}>Availability and disclaimers</h2><p style={paragraph}>We work to keep Shopes reliable but provide the service on an “as available” basis, subject to applicable law. Tool output is informational and may be incomplete or inaccurate. You should independently review important results before acting on them. Nothing in these terms excludes rights or liabilities that cannot legally be excluded.</p></section>
    <section style={section}><h2 style={heading}>Changes and contact</h2><p style={paragraph}>We may change the service or these terms as Shopes evolves. Continued use after updated terms are posted means you accept the updated terms to the extent permitted by law. For questions about these terms, use the contact or support method published on the Shopes website.</p></section>
    <p style={{ ...paragraph, marginTop: 36 }}>These terms are a general starting point and are not legal advice. Have them reviewed for the business entity, jurisdictions, and actual practices applicable to Shopes before treating them as final legal terms.</p>
    <p style={{ marginTop: 28 }}><Link href="/privacy" style={{ color: "#27865c", fontWeight: 700 }}>← Privacy Policy</Link></p>
  </main>;
}
