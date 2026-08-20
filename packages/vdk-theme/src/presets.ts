import { createTheme } from "./create-theme.js";
import { darkTheme, defaultTheme } from "./default-theme.js";
import type { VdkTheme } from "./types.js";

export type PresetId = "vara" | "varaDark" | "midnight" | "sunset" | "mono";

export type ThemePreset = {
  id: PresetId;
  label: string;
  /** Which base the preset was derived from — drives the playground's light/dark canvas. */
  scheme: "light" | "dark";
  theme: VdkTheme;
};

const midnight = createTheme(
  {
    colors: {
      background: "#0b0d17",
      card: "#141728",
      primary: "#7c6cff",
      primaryForeground: "#ffffff",
      secondary: "#1e2238",
      muted: "#171a2c",
      mutedForeground: "#9aa0bd",
      accent: "#252a45",
      border: "#282d47",
      input: "#171a2c",
      ring: "#7c6cff",
    },
    radius: { sm: "8px", md: "14px", lg: "20px" },
  },
  darkTheme,
);

const sunset = createTheme(
  {
    colors: {
      background: "#fffaf5",
      card: "#ffffff",
      primary: "#ff6b35",
      primaryForeground: "#ffffff",
      secondary: "#ffece1",
      secondaryForeground: "#4a1f0c",
      foreground: "#2b1509",
      muted: "#fff2ea",
      mutedForeground: "#8a6a58",
      accent: "#ffe4d4",
      border: "#f3ded0",
      input: "#fff2ea",
      ring: "#ff6b35",
    },
    radius: { sm: "4px", md: "8px", lg: "12px" },
  },
  defaultTheme,
);

const mono = createTheme(
  {
    colors: {
      background: "#ffffff",
      foreground: "#111111",
      card: "#ffffff",
      cardForeground: "#111111",
      primary: "#111111",
      primaryForeground: "#ffffff",
      secondary: "#f2f2f2",
      secondaryForeground: "#111111",
      muted: "#f7f7f7",
      mutedForeground: "#6b6b6b",
      accent: "#ededed",
      border: "#e0e0e0",
      input: "#f7f7f7",
      ring: "#111111",
    },
    radius: { sm: "2px", md: "3px", lg: "4px", full: "9999px" },
    typography: { fontFamily: '"JetBrains Mono", ui-monospace, SFMono-Regular, monospace' },
    effects: { shadow: { sm: "none", md: "0 4px 12px rgba(0,0,0,0.08)" } },
  },
  defaultTheme,
);

export const presets: ThemePreset[] = [
  { id: "vara", label: "Vara", scheme: "light", theme: defaultTheme },
  { id: "varaDark", label: "Vara Dark", scheme: "dark", theme: darkTheme },
  { id: "midnight", label: "Midnight", scheme: "dark", theme: midnight },
  { id: "sunset", label: "Sunset", scheme: "light", theme: sunset },
  { id: "mono", label: "Mono", scheme: "light", theme: mono },
];

export function getPreset(id: PresetId): ThemePreset {
  const preset = presets.find((item) => item.id === id);
  if (!preset) throw new Error(`Unknown VDK theme preset: ${id}`);
  return preset;
}
