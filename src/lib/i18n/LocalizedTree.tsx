"use client";

import { Children, cloneElement, isValidElement, useEffect, useState, type ReactElement, type ReactNode } from "react";
import { LOCALE_STORAGE_KEY, getLocale } from "./languages";
import { translateUiText } from "./ui-text";

type Props = { locale: string; children: ReactNode };
const TRANSLATABLE_ATTRIBUTES = ["aria-label", "aria-description", "placeholder", "title", "alt"] as const;

function localizeNode(node: ReactNode, locale: string): ReactNode {
  if (typeof node === "string") return translateUiText(locale, node);
  if (Array.isArray(node)) return Children.map(node, (child) => localizeNode(child, locale));
  if (!isValidElement(node)) return node;

  const element = node as ReactElement<Record<string, unknown>>;
  const nextProps: Record<string, unknown> = { ...element.props };
  for (const attribute of TRANSLATABLE_ATTRIBUTES) {
    const value = nextProps[attribute];
    if (typeof value === "string") nextProps[attribute] = translateUiText(locale, value);
  }
  if (nextProps.children !== undefined) {
    nextProps.children = localizeNode(nextProps.children as ReactNode, locale);
  }
  return cloneElement(element, nextProps);
}

export default function LocalizedTree({ locale: initialLocale, children }: Props) {
  const [locale, setLocale] = useState(initialLocale);
  useEffect(() => {
    try {
      setLocale(getLocale(window.localStorage.getItem(LOCALE_STORAGE_KEY) || initialLocale).code);
    } catch {
      setLocale(getLocale(initialLocale).code);
    }
    const onLocaleChange = (event: Event) => {
      const custom = event as CustomEvent<{ locale?: string }>;
      if (custom.detail?.locale) setLocale(getLocale(custom.detail.locale).code);
    };
    window.addEventListener("shopes:locale-change", onLocaleChange);
    return () => window.removeEventListener("shopes:locale-change", onLocaleChange);
  }, [initialLocale]);

  return <>{localizeNode(children, locale)}</>;
}
