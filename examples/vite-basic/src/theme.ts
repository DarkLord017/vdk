import { createTheme } from "@vara-dk/react";

/**
 * Paste what the playground's Theme tab gives you here. This one nudges three tokens; every
 * other token stays on the VDK default.
 */
export const theme = createTheme({
  colors: {
    primary: "#7c6cff",
    primaryForeground: "#ffffff",
    ring: "#7c6cff",
  },
  radius: {
    md: "14px",
  },
});
