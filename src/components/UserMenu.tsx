"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, CircleUserRound, LayoutDashboard, Search, FileSearch, Sparkles, BookOpen, Link2, LogOut, UserRound } from "lucide-react";
import styles from "./UserMenu.module.css";

type UserMenuProps = {
  name: string;
  email: string;
  image?: string | null;
  signOutAction: () => Promise<void>;
};

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/keyword-research", label: "Keyword Research", icon: Search },
  { href: "/audit", label: "Site Audit", icon: FileSearch },
  { href: "/product-intelligence", label: "Product Analysis", icon: Sparkles },
  { href: "/backlink-maker", label: "Backlink Maker", icon: Link2 },
  { href: "/blog", label: "Shopes Blog", icon: BookOpen },
];

export default function UserMenu({ name, email, image, signOutAction }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const initials = name.split(/[\s._-]+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "S";

  useEffect(() => {
    function closeOnOutside(event: MouseEvent) {
      if (event.target instanceof Node && !rootRef.current?.contains(event.target)) setOpen(false);
    }
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", closeOnOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  return (
    <div className={styles.root} ref={rootRef}>
      <button className={styles.trigger} type="button" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((value) => !value)}>
        <span className={styles.avatar}>
          {image ? <img src={image} alt="" referrerPolicy="no-referrer" /> : <span>{initials}</span>}
        </span>
        <span className={styles.triggerCopy}><strong>{name}</strong><small>My account</small></span>
        <ChevronDown className={open ? styles.chevronOpen : styles.chevron} size={15} aria-hidden="true" />
      </button>
      {open && (
        <div className={styles.menu} role="menu" aria-label="User menu">
          <div className={styles.identity}>
            <span className={styles.identityAvatar}>
              {image ? <img src={image} alt="" referrerPolicy="no-referrer" /> : <CircleUserRound size={22} />}
            </span>
            <span className={styles.identityCopy}><strong>{name}</strong><small>{email || "Google account"}</small><em>Personal workspace · Free plan</em></span>
          </div>
          <div className={styles.divider} />
          <span className={styles.sectionLabel}>WORKSPACE</span>
          {links.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} className={styles.menuLink} role="menuitem" onClick={() => setOpen(false)}>
              <Icon size={16} aria-hidden="true" /><span>{label}</span>
            </Link>
          ))}
          <div className={styles.divider} />
          <span className={styles.sectionLabel}>ACCOUNT</span>
          <div className={styles.accountDetail}><UserRound size={15} aria-hidden="true" /><span>{email || "Signed in with Google"}</span></div>
          <form action={signOutAction}>
            <button className={styles.signOut} type="submit"><LogOut size={16} aria-hidden="true" /> Sign out</button>
          </form>
        </div>
      )}
    </div>
  );
}
