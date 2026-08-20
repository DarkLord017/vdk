export { defaultTheme, darkTheme } from "./default-theme.js";
export { createTheme } from "./create-theme.js";
export { themeToCssVars, themeToCssText, CSS_VAR_PREFIX } from "./css-vars.js";
export { presets, getPreset } from "./presets.js";
export type { PresetId, ThemePreset } from "./presets.js";
export { diffTheme, serializeTheme } from "./serialize.js";
export type {
  VdkTheme,
  VdkThemeInput,
  ColorTokens,
  ColorScheme,
  RadiusTokens,
  SpacingTokens,
  TypographyTokens,
  FontSizeTokens,
  FontWeightTokens,
  SizingTokens,
  EffectTokens,
} from "./types.js";
