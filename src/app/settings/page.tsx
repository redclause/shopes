import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signOut } from "../../../auth";
import { ArrowLeft, ExternalLink, LogOut, ShieldCheck, ShoppingBag, UserRound } from "lucide-react";
import styles from "./page.module.css";

export default async function SettingsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login?callbackUrl=%2Fsettings");
  }

  const user = session.user;
  const displayName = user.name?.trim() || user.email?.split("@")[0] || "Shopes user";
  const initials = displayName
    .split(/[\s._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "S";

  async function signOutAction() {
    "use server";
    await signOut({ redirectTo: "/" });
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link href="/dashboard" className={styles.backLink}><ArrowLeft size={16} /> Back to dashboard</Link>
        <Link href="/" className={styles.brand} aria-label="Shopes home">
          <span className={styles.brandMark}><ShoppingBag size={18} /></span>
          <span>shopes<span className={styles.brandDot}>.</span></span>
        </Link>
        <span className={styles.headerLabel}>ACCOUNT SETTINGS</span>
      </header>

      <div className={styles.content}>
        <div className={styles.intro}>
          <span className={styles.eyebrow}>YOUR WORKSPACE</span>
          <h1>Account settings</h1>
          <p>Manage your Shopes access and review the Google account connected to your workspace.</p>
        </div>

        <section className={styles.card} aria-labelledby="profile-title">
          <div className={styles.cardHeading}>
            <span className={styles.cardIcon}><UserRound size={19} /></span>
            <div><h2 id="profile-title">Profile information</h2><p>These details come from your Google sign-in and are read-only in Shopes.</p></div>
          </div>

          <div className={styles.profile}>
            <span className={styles.avatar} aria-hidden="true">{initials}</span>
            <div className={styles.profileIdentity}>
              <strong>{displayName}</strong>
              <span>{user.email || "No email was provided by Google"}</span>
              <span className={styles.connected}><i /> Connected with Google</span>
            </div>
          </div>

          <dl className={styles.details}>
            <div><dt>Display name</dt><dd>{user.name || "Not provided"}</dd></div>
            <div><dt>Email address</dt><dd>{user.email || "Not provided"}</dd></div>
            <div><dt>Account provider</dt><dd>Google OAuth</dd></div>
            <div><dt>Shopes profile editing</dt><dd>Not available yet</dd></div>
          </dl>
          <p className={styles.note}>Shopes does not currently store a separate editable profile. Changes to your Google name or email should be made in your Google Account.</p>
          <a className={styles.secondaryButton} href="https://myaccount.google.com/" target="_blank" rel="noreferrer">
            Open Google Account <ExternalLink size={15} />
          </a>
        </section>

        <section className={styles.card} aria-labelledby="security-title">
          <div className={styles.cardHeading}>
            <span className={styles.cardIcon}><ShieldCheck size={19} /></span>
            <div><h2 id="security-title">Sign-in and security</h2><p>Shopes uses your Google account to authenticate access to this workspace.</p></div>
          </div>
          <div className={styles.securityRow}>
            <div><strong>Google sign-in</strong><p>Your Google credentials are managed by Google. Shopes does not ask for your Google password.</p></div>
            <span className={styles.status}>Connected</span>
          </div>
          <div className={styles.securityRow}>
            <div><strong>Private workspace</strong><p>Dashboard pages require an authenticated session. Project features will need ownership checks when persistence is introduced.</p></div>
            <span className={styles.status}>Session active</span>
          </div>
          <form action={signOutAction}>
            <button className={styles.signOutButton} type="submit"><LogOut size={16} /> Sign out of Shopes</button>
          </form>
        </section>

        <p className={styles.footer}>Shopes account settings · No separate profile data or account preferences are stored yet.</p>
      </div>
    </main>
  );
}
