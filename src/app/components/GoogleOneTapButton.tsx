"use client";

import Script from "next/script";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";

declare global {
  interface Window {
    google?: {
      accounts?: {
        id?: {
          initialize: (options: {
            client_id: string;
            nonce: string;
            callback: (response: { credential?: string }) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
            use_fedcm_for_prompt?: boolean;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: {
              type?: "standard" | "icon";
              theme?: "outline" | "filled_blue" | "filled_black";
              size?: "large" | "medium" | "small";
              text?: "signin_with" | "signup_with" | "continue_with" | "signin";
              shape?: "rectangular" | "pill" | "circle" | "square";
              logo_alignment?: "left" | "center";
              width?: number;
              locale?: string;
            },
          ) => void;
          prompt: (callback?: (notification: {
            isNotDisplayed: () => boolean;
            isSkippedMoment: () => boolean;
            isDismissedMoment: () => boolean;
            getNotDisplayedReason?: () => string;
            getSkippedReason?: () => string;
          }) => void) => void;
        };
      };
    };
  }
}

type GoogleOneTapButtonProps = {
  className?: string;
  label?: string;
  redirectTo?: string;
  autoPrompt?: boolean;
  fallbackHref?: string;
};

export default function GoogleOneTapButton({
  className = "",
  label = "Continue with Google",
  redirectTo,
  autoPrompt = false,
  fallbackHref,
}: GoogleOneTapButtonProps) {
  const router = useRouter();
  const buttonContainerRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);
  const initializing = useRef(false);
  const rendered = useRef(false);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const onCredential = useCallback(async (response: { credential?: string }) => {
    if (busy) return;
    if (!response.credential) {
      setMessage("Google did not return a sign-in credential. Please try again.");
      return;
    }

    setBusy(true);
    setMessage("Verifying your Google account…");
    try {
      const result = await signIn("google-one-tap", {
        credential: response.credential,
        redirect: false,
      });
      if (result?.error || !result?.ok) {
        setMessage("Sign-in could not be completed. Please try again or use standard Google sign-in.");
        return;
      }

      setMessage("You’re signed in to Shopes.");
      router.refresh();
      if (redirectTo) router.replace(redirectTo);
    } catch {
      setMessage("Sign-in is temporarily unavailable. Please try again.");
    } finally {
      setBusy(false);
    }
  }, [busy, redirectTo, router]);

  const initialize = useCallback(async () => {
    if (initialized.current || initializing.current || !window.google?.accounts?.id) return;
    initializing.current = true;
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) {
      initializing.current = false;
      setMessage("Google sign-in is not configured for this deployment.");
      return;
    }

    try {
      const nonceResponse = await fetch("/api/auth/google-one-tap/nonce", {
        method: "GET",
        credentials: "same-origin",
        cache: "no-store",
      });
      if (!nonceResponse.ok) throw new Error("Could not initialize secure sign-in.");
      const nonceData = (await nonceResponse.json()) as { nonce?: string };
      if (!nonceData.nonce) throw new Error("Missing sign-in nonce.");

      window.google.accounts.id.initialize({
        client_id: clientId,
        nonce: nonceData.nonce,
        callback: (response) => { void onCredential(response); },
        auto_select: false,
        cancel_on_tap_outside: true,
        use_fedcm_for_prompt: true,
      });
      initialized.current = true;
      setReady(true);
      if (autoPrompt) {
        window.google.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            setMessage("Google One Tap isn’t available right now. You can still use the Google button below.");
          }
        });
      }
    } catch {
      setMessage("Google sign-in could not start. Please try again.");
    } finally {
      initializing.current = false;
    }
  }, [autoPrompt, onCredential]);

  useEffect(() => {
    if (!ready || rendered.current || !buttonContainerRef.current || !window.google?.accounts?.id) return;
    const availableWidth = buttonContainerRef.current.parentElement?.clientWidth || 320;
    const buttonWidth = className.includes("google-cta")
      ? 200
      : Math.min(360, Math.max(200, availableWidth));
    window.google.accounts.id.renderButton(buttonContainerRef.current, {
      type: "standard",
      theme: "outline",
      size: "large",
      text: "continue_with",
      shape: "rectangular",
      logo_alignment: "left",
      width: buttonWidth,
      locale: "en",
    });
    rendered.current = true;
  }, [className, ready]);

  useEffect(() => {
    if (window.google?.accounts?.id) void initialize();
  }, [initialize]);

  return (
    <span className="google-one-tap-control">
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={() => { void initialize(); }}
        onError={() => setMessage("Google sign-in could not load. Check your connection and try again.")}
      />
      <span className={className} aria-label={label} aria-busy={busy}>
        <span
          ref={buttonContainerRef}
          className={busy ? "google-one-tap-rendered-button is-busy" : "google-one-tap-rendered-button"}
          aria-label={label}
        />
        {busy && <span className="google-one-tap-busy-indicator"><LoaderCircle size={15} className="google-one-tap-spinner" aria-hidden="true" /> Signing in…</span>}
      </span>
      {message && <span className="google-one-tap-status" role="status" aria-live="polite">{message}{fallbackHref && !message.toLowerCase().includes("signed in") && <Link className="google-one-tap-fallback" href={fallbackHref}>Use standard Google sign-in</Link>}</span>}
    </span>
  );
}
