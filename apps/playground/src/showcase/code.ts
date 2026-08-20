import type { ControlValue } from "./types.js";

type Attrs = Record<string, ControlValue | number | undefined>;

/**
 * Render a JSX snippet from the current control values, skipping anything left at its
 * default so the copied code is what a developer would actually have typed.
 */
export function jsx(
  name: string,
  attrs: Attrs,
  options: { children?: string; defaults?: Attrs } = {},
): string {
  const { children, defaults = {} } = options;

  const parts = Object.entries(attrs)
    .filter(([key, value]) => value !== undefined && value !== "" && value !== defaults[key])
    .map(([key, value]) => {
      if (value === true) return key;
      if (value === false) return `${key}={false}`;
      if (typeof value === "number") return `${key}={${value}}`;
      return `${key}="${value}"`;
    });

  const isMultiline = parts.join(" ").length > 52;
  const attrText = isMultiline ? `\n  ${parts.join("\n  ")}\n` : parts.length ? ` ${parts.join(" ")}` : "";

  if (children === undefined) return `<${name}${attrText}${isMultiline ? "" : " "}/>`;

  return `<${name}${attrText}${isMultiline ? "" : ""}>${children}</${name}>`;
}
