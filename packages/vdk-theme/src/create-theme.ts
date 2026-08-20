import { defaultTheme } from "./default-theme.js";
import type { VdkTheme, VdkThemeInput } from "./types.js";

/**
 * Merge a partial theme over a base one. Nesting is exactly two levels deep in the token
 * contract (`typography.fontSize.md`), so an explicit merge beats a generic deep-merge and
 * keeps the return type exact.
 */
export function createTheme(input: VdkThemeInput = {}, base: VdkTheme = defaultTheme): VdkTheme {
  return {
    colors: { ...base.colors, ...input.colors },
    radius: { ...base.radius, ...input.radius },
    spacing: { ...base.spacing, ...input.spacing },
    typography: {
      ...base.typography,
      ...input.typography,
      fontSize: { ...base.typography.fontSize, ...input.typography?.fontSize },
      fontWeight: { ...base.typography.fontWeight, ...input.typography?.fontWeight },
    },
    sizing: {
      controlHeight: {
        ...base.sizing.controlHeight,
        ...input.sizing?.controlHeight,
      },
    },
    effects: {
      shadow: { ...base.effects.shadow, ...input.effects?.shadow },
      transition: input.effects?.transition ?? base.effects.transition,
    },
  };
}
