"use client";

import { Children, cloneElement, isValidElement, type ReactElement, type ReactNode } from "react";
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

export default function LocalizedTree({ locale, children }: Props) {
  return <>{localizeNode(children, locale)}</>;
}
