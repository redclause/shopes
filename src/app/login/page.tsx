import Link from "next/link";
import { signIn } from "../../../auth";
import { ArrowLeft, ShieldCheck, ShoppingBag } from "lucide-react";

type LoginPageProps = {
  searchParams: Promise<{ callbackUrl?: string | string[] }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const callbackValue = params.callbackUrl;
  const callbackUrl =
    typeof callbackValue === "string" && callbackValue.startsWith("/")
      ? callbackValue
      : "/dashboard";

  async function signInWithGoogle() {
    "use server";
    await signIn("google", { redirectTo: callbackUrl });
  }

  return (
    <main className="login-page">
      <section className="login-card" aria-labelledby="login-title">
        <Link href="/" className="login-brand" aria-label="Shopes home">
          <span className="login-brand-mark"><ShoppingBag size={19} /></span>
          <span>shopes<span className="login-brand-dot">.</span></span>
        </Link>
        <div className="login-icon"><ShieldCheck size={21} /></div>
        <p className="login-eyebrow">YOUR SHOPES WORKSPACE</p>
        <h1 id="login-title">Welcome back.</h1>
        <p className="login-description">
          Sign in securely with your Google account to access your workspace.
        </p>
        <form action={signInWithGoogle}>
          <button className="google-signin-button" type="submit">
            <GoogleMark />
            Continue with Google
          </button>
        </form>
        <p className="login-privacy">
          Your account session is protected. Shopes will receive the basic
          profile information Google shares for sign-in.
        </p>
        <Link className="login-back-link" href="/">
          <ArrowLeft size={14} /> Back to Shopes
        </Link>
      </section>
    </main>
  );
}

function GoogleMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 48 48" width="19" height="19">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z" transform="translate(0 4)" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.72 7.18l7.62 5.91c4.45-4.11 7.14-10.17 7.14-17.56Z" />
      <path fill="#FBBC05" d="M10.53 28.59A14.4 14.4 0 0 1 9.75 24c0-1.59.27-3.13.76-4.59l-7.98-6.19A23.9 23.9 0 0 0 0 24c0 3.87.93 7.52 2.56 10.78l7.97-6.19Z" transform="translate(0 0)" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.9-5.79l-7.62-5.91c-2.12 1.42-4.84 2.26-8.28 2.26-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48Z" />
    </svg>
  );
}
