"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export default function SignOutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ redirectTo: "/" })}
      aria-label="Sign out"
      title="Sign out"
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 7,
        border: "1px solid #e2e9e1",
        borderRadius: 8,
        padding: "7px 9px",
        background: "#fff",
        color: "#526258",
        fontSize: 11,
        fontWeight: 700,
        cursor: "pointer",
      }}
    >
      <LogOut size={15} /> Sign out
    </button>
  );
}
