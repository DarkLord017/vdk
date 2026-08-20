/**
 * The VDK token contract.
 *
 * Every visual decision in @vara-dk/react resolves to one of these tokens, compiled to a
 * CSS custom property (`--vdk-color-primary`, `--vdk-radius-md`, ...). Components never
 * contain literal colors, which is what makes a theme swap instant and total.
 */

export type ColorTokens = {
  /** Page/surface behind everything. */
  background: string;
  /** Default text color on `background`. */
  foreground: string;
  /** Raised surface: cards, modals, dropdown panels. */
  card: string;
  /** Text on `card`. */
  cardForeground: string;
  /** Brand action color: primary buttons, focus accents, active states. */
  primary: string;
  /** Text/icon color on top of `primary`. */
  primaryForeground: string;
  /** Low-emphasis action surface. */
  secondary: string;
  /** Text on `secondary`. */
  secondaryForeground: string;
  /** Subtle fill for inert areas (skeletons, empty rows). */
  muted: string;
  /** De-emphasized text: hints, addresses, secondary labels. */
  mutedForeground: string;
  /** Hover/selected wash on interactive rows. */
  accent: string;
  /** Hairlines and dividers. */
  border: string;
  /** Input field fill. */
  input: string;
  /** Focus ring. */
  ring: string;
  success: string;
  warning: string;
  danger: string;
  /** Text/icon color on top of `danger`. */
  dangerForeground: string;
};

export type RadiusTokens = {
  sm: string;
  md: string;
  lg: string;
  full: string;
};

export type SpacingTokens = {
  /** Base grid step in px. All gaps and paddings are multiples of this. */
  unit: number;
};

export type FontSizeTokens = {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
};

export type FontWeightTokens = {
  normal: string;
  medium: string;
  bold: string;
};

export type TypographyTokens = {
  fontFamily: string;
  fontFamilyMono: string;
  fontSize: FontSizeTokens;
  fontWeight: FontWeightTokens;
};

export type SizingTokens = {
  /** Height of interactive controls (buttons, inputs, selects) per size. */
  controlHeight: {
    sm: string;
    md: string;
    lg: string;
  };
};

export type EffectTokens = {
  shadow: {
    sm: string;
    md: string;
  };
  transition: string;
};

export type VdkTheme = {
  colors: ColorTokens;
  radius: RadiusTokens;
  spacing: SpacingTokens;
  typography: TypographyTokens;
  sizing: SizingTokens;
  effects: EffectTokens;
};

/** A partial theme, nested one level deep — what `createTheme` accepts. */
export type VdkThemeInput = {
  colors?: Partial<ColorTokens>;
  radius?: Partial<RadiusTokens>;
  spacing?: Partial<SpacingTokens>;
  typography?: Partial<Omit<TypographyTokens, "fontSize" | "fontWeight">> & {
    fontSize?: Partial<FontSizeTokens>;
    fontWeight?: Partial<FontWeightTokens>;
  };
  sizing?: {
    controlHeight?: Partial<SizingTokens["controlHeight"]>;
  };
  effects?: {
    shadow?: Partial<EffectTokens["shadow"]>;
    transition?: string;
  };
};

export type ColorScheme = "light" | "dark" | "system";
