"use client";

import Script from "next/script";
import { signIn } from "next-auth/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, LoaderCircle } from "lucide-react";

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
};

export default function GoogleOneTapButton({
  className = "",
  label = "Continue with Google",
  redirectTo,
  autoPrompt = true,
}: GoogleOneTapButtonProps) {
  const router = useRouter();
  const initialized = useRef(false);
  const initializing = useRef(false);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const onCredential = useCallback(async (response: { credential?: string }) => {
    if (!response.credential || busy) {
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
            setMessage("Google One Tap isn’t available right now. Use the button to try again.");
          }
        });
      }
    } catch {
      setMessage("Google One Tap could not start. Please try again.");
    } finally {
      initializing.current = false;
    }
  }, [autoPrompt, onCredential]);

  useEffect(() => {
    if (window.google?.accounts?.id) void initialize();
  }, [initialize]);

  function openOneTap() {
    setMessage("");
    if (window.google?.accounts?.id && initialized.current) {
      window.google.accounts.id.prompt();
    } else {
      setMessage("Google sign-in is still loading. Please try again in a moment.");
    }
  }

  return (
    <span className="google-one-tap-control">
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={() => { void initialize(); }}
        onError={() => setMessage("Google sign-in could not load. Check your connection and try again.")}
      />
      <button
        type="button"
        className={className}
        onClick={openOneTap}
        disabled={busy || !ready}
        aria-busy={busy}
      >
        {busy ? <LoaderCircle size={15} className="google-one-tap-spinner" aria-hidden="true" /> : null}
        {label}
        {!busy && <ArrowRight size={14} aria-hidden="true" />}
      </button>
      {message && <span className="google-one-tap-status" role="status" aria-live="polite">{message}</span>}
    </span>
  );
}
