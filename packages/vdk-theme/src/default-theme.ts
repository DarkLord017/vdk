import type { VdkTheme } from "./types.js";

const SHARED = {
  radius: {
    sm: "6px",
    md: "10px",
    lg: "16px",
    full: "9999px",
  },
  spacing: {
    unit: 4,
  },
  typography: {
    fontFamily:
      '"Anuphan", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontFamilyMono: '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace',
    fontSize: {
      xs: "12px",
      sm: "13px",
      md: "14px",
      lg: "16px",
      xl: "20px",
    },
    fontWeight: {
      normal: "400",
      medium: "500",
      bold: "600",
    },
  },
  sizing: {
    controlHeight: {
      sm: "32px",
      md: "40px",
      lg: "48px",
    },
  },
} satisfies Omit<VdkTheme, "colors" | "effects">;

/** Vara light — the default look of the kit. */
export const defaultTheme: VdkTheme = {
  ...SHARED,
  colors: {
    background: "#ffffff",
    foreground: "#0c1618",
    card: "#ffffff",
    cardForeground: "#0c1618",
    primary: "#00b4a0",
    primaryForeground: "#00231f",
    secondary: "#eef2f2",
    secondaryForeground: "#0c1618",
    muted: "#f4f7f7",
    mutedForeground: "#58696e",
    accent: "#e6f7f5",
    border: "#dde5e6",
    input: "#f4f7f7",
    ring: "#00b4a0",
    success: "#00a86b",
    warning: "#e5a000",
    danger: "#e5484d",
    dangerForeground: "#ffffff",
  },
  effects: {
    shadow: {
      sm: "0 1px 2px rgba(12, 22, 24, 0.06)",
      md: "0 8px 24px rgba(12, 22, 24, 0.12)",
    },
    transition: "160ms cubic-bezier(0.4, 0, 0.2, 1)",
  },
};

/** Vara dark — the counterpart used when `colorScheme` resolves to dark. */
export const darkTheme: VdkTheme = {
  ...SHARED,
  colors: {
    background: "#0c1618",
    foreground: "#eef2f2",
    card: "#122023",
    cardForeground: "#eef2f2",
    primary: "#00d9c0",
    primaryForeground: "#00231f",
    secondary: "#1b2c30",
    secondaryForeground: "#eef2f2",
    muted: "#16262a",
    mutedForeground: "#9cacb1",
    accent: "#173a38",
    border: "#233b40",
    input: "#16262a",
    ring: "#00d9c0",
    success: "#30c48d",
    warning: "#f0b429",
    danger: "#ff6369",
    dangerForeground: "#1a0507",
  },
  effects: {
    shadow: {
      sm: "0 1px 2px rgba(0, 0, 0, 0.4)",
      md: "0 8px 24px rgba(0, 0, 0, 0.5)",
    },
    transition: "160ms cubic-bezier(0.4, 0, 0.2, 1)",
  },
};
