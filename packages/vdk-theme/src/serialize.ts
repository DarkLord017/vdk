import { defaultTheme } from "./default-theme.js";
import type { VdkTheme, VdkThemeInput } from "./types.js";

/**
 * Everything in `theme` that differs from `base`.
 *
 * The playground pastes this into `createTheme(...)`, so a user who nudged two colors gets
 * a two-line snippet instead of the full 40-token dump.
 */
export function diffTheme(theme: VdkTheme, base: VdkTheme = defaultTheme): VdkThemeInput {
  const diff: VdkThemeInput = {};

  const colors = pickChanged(theme.colors, base.colors);
  if (colors) diff.colors = colors;

  const radius = pickChanged(theme.radius, base.radius);
  if (radius) diff.radius = radius;

  if (theme.spacing.unit !== base.spacing.unit) {
    diff.spacing = { unit: theme.spacing.unit };
  }

  const typography: NonNullable<VdkThemeInput["typography"]> = {};
  if (theme.typography.fontFamily !== base.typography.fontFamily) {
    typography.fontFamily = theme.typography.fontFamily;
  }
  if (theme.typography.fontFamilyMono !== base.typography.fontFamilyMono) {
    typography.fontFamilyMono = theme.typography.fontFamilyMono;
  }
  const fontSize = pickChanged(theme.typography.fontSize, base.typography.fontSize);
  if (fontSize) typography.fontSize = fontSize;
  const fontWeight = pickChanged(theme.typography.fontWeight, base.typography.fontWeight);
  if (fontWeight) typography.fontWeight = fontWeight;
  if (Object.keys(typography).length > 0) diff.typography = typography;

  const controlHeight = pickChanged(theme.sizing.controlHeight, base.sizing.controlHeight);
  if (controlHeight) diff.sizing = { controlHeight };

  const effects: NonNullable<VdkThemeInput["effects"]> = {};
  const shadow = pickChanged(theme.effects.shadow, base.effects.shadow);
  if (shadow) effects.shadow = shadow;
  if (theme.effects.transition !== base.effects.transition) {
    effects.transition = theme.effects.transition;
  }
  if (Object.keys(effects).length > 0) diff.effects = effects;

  return diff;
}

/**
 * The copy-paste snippet shown in the playground's Theme tab: a `createTheme` call carrying
 * only the overridden tokens.
 */
export function serializeTheme(
  theme: VdkTheme,
  options: { base?: VdkTheme; baseName?: string } = {},
): string {
  const { base = defaultTheme, baseName } = options;
  const diff = diffTheme(theme, base);
  const body = stringify(diff, 1);
  const baseArg = baseName ? `, ${baseName}` : "";

  return `import { createTheme } from "@vara-dk/theme";\n\nexport const theme = createTheme(${body}${baseArg});`;
}

function pickChanged<T extends Record<string, string | number>>(
  next: T,
  base: T,
): Partial<T> | undefined {
  const changed: Partial<T> = {};
  let hasChange = false;

  for (const key of Object.keys(next) as (keyof T)[]) {
    if (next[key] !== base[key]) {
      changed[key] = next[key];
      hasChange = true;
    }
  }

  return hasChange ? changed : undefined;
}

function stringify(value: unknown, depth: number): string {
  const pad = "  ".repeat(depth);
  const closePad = "  ".repeat(depth - 1);

  if (typeof value !== "object" || value === null) return JSON.stringify(value);

  const entries = Object.entries(value as Record<string, unknown>);
  if (entries.length === 0) return "{}";

  const lines = entries.map(([key, item]) => `${pad}${quoteKey(key)}: ${stringify(item, depth + 1)},`);
  return `{\n${lines.join("\n")}\n${closePad}}`;
}

function quoteKey(key: string): string {
  return /^[A-Za-z_$][\w$]*$/.test(key) ? key : JSON.stringify(key);
}
