import {
  createTheme,
  darkTheme,
  defaultTheme,
  themeToCssVars,
  type ColorScheme,
  type VdkTheme,
  type VdkThemeInput,
} from "@vara-dk/theme";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

type ThemeContextValue = {
  theme: VdkTheme;
  /** The scheme actually in effect — `system` already resolved. */
  resolvedScheme: "light" | "dark";
  /**
   * The element carrying the theme's CSS variables. Overlays portal into this rather than
   * `document.body`, otherwise they would render outside the variable scope and lose the
   * theme entirely.
   */
  rootElement: HTMLElement | null;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export type VdkThemeProviderProps = {
  /**
   * A full theme (from `createTheme`) or a partial override. A partial is merged over the
   * light or dark base according to the resolved color scheme, so `{ colors: { primary } }`
   * keeps working in both schemes.
   */
  theme?: VdkTheme | VdkThemeInput;
  colorScheme?: ColorScheme;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
};

export function VdkThemeProvider({
  theme,
  colorScheme = "light",
  className,
  style,
  children,
}: VdkThemeProviderProps) {
  const systemScheme = useSystemColorScheme();
  const resolvedScheme = colorScheme === "system" ? systemScheme : colorScheme;
  const [rootElement, setRootElement] = useState<HTMLElement | null>(null);

  const value = useMemo<ThemeContextValue>(() => {
    const base = resolvedScheme === "dark" ? darkTheme : defaultTheme;
    const resolved = theme ? (isFullTheme(theme) ? theme : createTheme(theme, base)) : base;

    return { theme: resolved, resolvedScheme, rootElement };
  }, [theme, resolvedScheme, rootElement]);

  const cssVars = useMemo(() => themeToCssVars(value.theme), [value.theme]);

  return (
    <ThemeContext.Provider value={value}>
      <div
        ref={setRootElement}
        data-vdk-root=""
        data-vdk-scheme={resolvedScheme}
        className={className}
        style={{ ...(cssVars as CSSProperties), ...style }}
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

/** The theme currently in effect. Throws outside a provider so misuse fails loudly. */
export function useVdkTheme(): ThemeContextValue {
  const value = useContext(ThemeContext);
  if (!value) throw new Error("useVdkTheme must be used within <VdkProvider>");
  return value;
}

function isFullTheme(theme: VdkTheme | VdkThemeInput): theme is VdkTheme {
  const colors = (theme as VdkTheme).colors;
  return Boolean(colors && "background" in colors && "primary" in colors && "border" in colors);
}

function useSystemColorScheme(): "light" | "dark" {
  const [scheme, setScheme] = useState<"light" | "dark">(() => {
    if (typeof window === "undefined" || !window.matchMedia) return "light";
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;

    const query = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = (event: MediaQueryListEvent) => setScheme(event.matches ? "dark" : "light");

    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  return scheme;
}
