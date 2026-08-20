import {
  createTheme,
  darkTheme,
  defaultTheme,
  diffTheme,
  getPreset,
  type PresetId,
  type VdkTheme,
  type VdkThemeInput,
} from "@vara-dk/theme";
import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "vdk-playground-theme";
const URL_KEY = "theme";

export type ThemeState = {
  presetId: PresetId;
  scheme: "light" | "dark";
  /** Everything the user changed on top of the preset. */
  overrides: VdkThemeInput;
};

const INITIAL: ThemeState = { presetId: "vara", scheme: "light", overrides: {} };

/**
 * Playground theme state, shareable by URL.
 *
 * Only the diff against the preset is persisted, so a link stays short and keeps working
 * when a preset's own tokens change.
 */
export function useThemeState() {
  const [state, setState] = useState<ThemeState>(() => readFromUrl() ?? readFromStorage() ?? INITIAL);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));

    const url = new URL(window.location.href);
    if (isPristine(state)) url.searchParams.delete(URL_KEY);
    else url.searchParams.set(URL_KEY, encodeState(state));

    window.history.replaceState(null, "", url);
  }, [state]);

  const base = state.scheme === "dark" ? darkTheme : defaultTheme;
  const presetTheme = getPreset(state.presetId).theme;
  const theme: VdkTheme = createTheme(state.overrides, presetTheme);

  const setPreset = useCallback((presetId: PresetId) => {
    const preset = getPreset(presetId);
    // Adopting a preset means starting from it, not layering old edits on top.
    setState({ presetId, scheme: preset.scheme, overrides: {} });
  }, []);

  const setScheme = useCallback((scheme: "light" | "dark") => {
    setState((current) => {
      // Keep the user's edits, but re-base them on the preset that matches the new scheme.
      const presetId: PresetId =
        scheme === "dark" && current.presetId === "vara"
          ? "varaDark"
          : scheme === "light" && current.presetId === "varaDark"
            ? "vara"
            : current.presetId;

      return { ...current, scheme, presetId };
    });
  }, []);

  const setToken = useCallback((update: VdkThemeInput) => {
    setState((current) => ({
      ...current,
      overrides: mergeOverrides(current.overrides, update),
    }));
  }, []);

  const reset = useCallback(() => {
    setState((current) => ({ ...current, overrides: {} }));
  }, []);

  const shareUrl = () => {
    const url = new URL(window.location.href);
    if (!isPristine(state)) url.searchParams.set(URL_KEY, encodeState(state));
    return url.toString();
  };

  return {
    state,
    theme,
    base,
    presetTheme,
    /** Tokens the user changed on top of the preset — what the Theme tab serializes. */
    overrides: diffTheme(theme, presetTheme),
    setPreset,
    setScheme,
    setToken,
    reset,
    shareUrl,
  };
}

function mergeOverrides(current: VdkThemeInput, update: VdkThemeInput): VdkThemeInput {
  return {
    ...current,
    ...update,
    colors: { ...current.colors, ...update.colors },
    radius: { ...current.radius, ...update.radius },
    spacing: { ...current.spacing, ...update.spacing },
    typography: {
      ...current.typography,
      ...update.typography,
      fontSize: { ...current.typography?.fontSize, ...update.typography?.fontSize },
      fontWeight: { ...current.typography?.fontWeight, ...update.typography?.fontWeight },
    },
    sizing: {
      controlHeight: {
        ...current.sizing?.controlHeight,
        ...update.sizing?.controlHeight,
      },
    },
  };
}

function isPristine(state: ThemeState): boolean {
  return state.presetId === "vara" && state.scheme === "light" && isEmpty(state.overrides);
}

function isEmpty(overrides: VdkThemeInput): boolean {
  return Object.values(overrides).every(
    (group) => !group || Object.keys(group).length === 0 || isEmpty(group as VdkThemeInput),
  );
}

function encodeState(state: ThemeState): string {
  return btoa(encodeURIComponent(JSON.stringify(state)));
}

function decodeState(value: string): ThemeState | null {
  try {
    const parsed = JSON.parse(decodeURIComponent(atob(value))) as ThemeState;
    if (!parsed.presetId || !parsed.scheme) return null;
    return parsed;
  } catch {
    return null;
  }
}

function readFromUrl(): ThemeState | null {
  const value = new URL(window.location.href).searchParams.get(URL_KEY);
  return value ? decodeState(value) : null;
}

function readFromStorage(): ThemeState | null {
  const value = localStorage.getItem(STORAGE_KEY);
  if (!value) return null;

  try {
    return JSON.parse(value) as ThemeState;
  } catch {
    return null;
  }
}
