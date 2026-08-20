import type { VdkTheme } from "./types.js";

/** Prefix for every custom property VDK emits. */
export const CSS_VAR_PREFIX = "--vdk";

/**
 * Flatten a theme into CSS custom properties.
 *
 * The playground applies the result as inline styles on the preview wrapper, which is why
 * theme edits land without a React re-render of the previewed component.
 */
export function themeToCssVars(theme: VdkTheme): Record<string, string> {
  const vars: Record<string, string> = {};

  for (const [name, value] of Object.entries(theme.colors)) {
    vars[`${CSS_VAR_PREFIX}-color-${kebab(name)}`] = value;
  }

  for (const [name, value] of Object.entries(theme.radius)) {
    vars[`${CSS_VAR_PREFIX}-radius-${name}`] = value;
  }

  const unit = theme.spacing.unit;
  vars[`${CSS_VAR_PREFIX}-space-unit`] = `${unit}px`;
  // Pre-computed steps so stylesheets can write var(--vdk-space-3) instead of calc().
  for (let step = 1; step <= 12; step += 1) {
    vars[`${CSS_VAR_PREFIX}-space-${step}`] = `${unit * step}px`;
  }

  vars[`${CSS_VAR_PREFIX}-font-family`] = theme.typography.fontFamily;
  vars[`${CSS_VAR_PREFIX}-font-family-mono`] = theme.typography.fontFamilyMono;
  for (const [name, value] of Object.entries(theme.typography.fontSize)) {
    vars[`${CSS_VAR_PREFIX}-font-size-${name}`] = value;
  }
  for (const [name, value] of Object.entries(theme.typography.fontWeight)) {
    vars[`${CSS_VAR_PREFIX}-font-weight-${name}`] = value;
  }

  for (const [name, value] of Object.entries(theme.sizing.controlHeight)) {
    vars[`${CSS_VAR_PREFIX}-control-height-${name}`] = value;
  }

  for (const [name, value] of Object.entries(theme.effects.shadow)) {
    vars[`${CSS_VAR_PREFIX}-shadow-${name}`] = value;
  }
  vars[`${CSS_VAR_PREFIX}-transition`] = theme.effects.transition;

  return vars;
}

/** Render the same vars as a CSS rule body, for consumers who prefer a stylesheet. */
export function themeToCssText(theme: VdkTheme, selector = ":root"): string {
  const body = Object.entries(themeToCssVars(theme))
    .map(([name, value]) => `  ${name}: ${value};`)
    .join("\n");

  return `${selector} {\n${body}\n}`;
}

function kebab(value: string): string {
  return value.replace(/[A-Z]/g, (char) => `-${char.toLowerCase()}`);
}
