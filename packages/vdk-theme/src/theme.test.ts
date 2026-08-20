import { describe, expect, it } from "vitest";

import { createTheme } from "./create-theme.js";
import { themeToCssVars } from "./css-vars.js";
import { darkTheme, defaultTheme } from "./default-theme.js";
import { presets } from "./presets.js";
import { diffTheme, serializeTheme } from "./serialize.js";

describe("createTheme", () => {
  it("merges nested overrides without dropping sibling tokens", () => {
    const theme = createTheme({
      colors: { primary: "#ff0000" },
      typography: { fontSize: { md: "15px" } },
    });

    expect(theme.colors.primary).toBe("#ff0000");
    expect(theme.colors.background).toBe(defaultTheme.colors.background);
    expect(theme.typography.fontSize.md).toBe("15px");
    expect(theme.typography.fontSize.lg).toBe(defaultTheme.typography.fontSize.lg);
    expect(theme.typography.fontFamily).toBe(defaultTheme.typography.fontFamily);
  });

  it("honours an alternate base", () => {
    const theme = createTheme({ colors: { primary: "#abcdef" } }, darkTheme);

    expect(theme.colors.background).toBe(darkTheme.colors.background);
    expect(theme.colors.primary).toBe("#abcdef");
  });
});

describe("themeToCssVars", () => {
  it("emits kebab-cased color vars and precomputed spacing steps", () => {
    const vars = themeToCssVars(defaultTheme);

    expect(vars["--vdk-color-primary"]).toBe(defaultTheme.colors.primary);
    expect(vars["--vdk-color-primary-foreground"]).toBe(defaultTheme.colors.primaryForeground);
    expect(vars["--vdk-space-unit"]).toBe("4px");
    expect(vars["--vdk-space-3"]).toBe("12px");
    expect(vars["--vdk-control-height-md"]).toBe(defaultTheme.sizing.controlHeight.md);
  });

  it("scales spacing steps with the unit", () => {
    const vars = themeToCssVars(createTheme({ spacing: { unit: 6 } }));
    expect(vars["--vdk-space-3"]).toBe("18px");
  });
});

describe("diffTheme / serializeTheme", () => {
  it("returns nothing for an unmodified theme", () => {
    expect(diffTheme(defaultTheme)).toEqual({});
  });

  it("returns only the changed tokens", () => {
    const theme = createTheme({ colors: { primary: "#123456" }, radius: { md: "2px" } });

    expect(diffTheme(theme)).toEqual({
      colors: { primary: "#123456" },
      radius: { md: "2px" },
    });
  });

  it("produces a snippet that round-trips back to the same theme", () => {
    const theme = createTheme({
      colors: { primary: "#123456" },
      spacing: { unit: 6 },
      effects: { transition: "0ms linear" },
    });

    const snippet = serializeTheme(theme);
    expect(snippet).toContain('primary: "#123456"');
    expect(snippet).toContain("unit: 6");

    expect(createTheme(diffTheme(theme))).toEqual(theme);
  });
});

describe("presets", () => {
  it("all presets are complete themes", () => {
    for (const preset of presets) {
      expect(Object.keys(preset.theme.colors)).toEqual(Object.keys(defaultTheme.colors));
      expect(preset.theme.spacing.unit).toBeGreaterThan(0);
    }
  });
});
