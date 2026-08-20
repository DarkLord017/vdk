import { AccountProvider, AlertProvider, ApiProvider } from "@gear-js/react-hooks";
import type { ColorScheme, VdkTheme, VdkThemeInput } from "@vara-dk/theme";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useMemo, type CSSProperties, type ReactNode } from "react";

import { AlertTemplate } from "../feedback/alert-template.js";
import { resolveNetwork, type NetworkInput } from "./network.js";
import { VdkThemeProvider } from "./theme-context.js";

export type VdkProviderProps = {
  /** Name shown by the wallet extension when it asks the user to authorize the dApp. */
  appName?: string;
  /** `"mainnet"` (default), `"testnet"`, `"local"`, or `{ id, label, endpoint }`. */
  network?: NetworkInput;
  theme?: VdkTheme | VdkThemeInput;
  colorScheme?: ColorScheme;
  /** Supply your own client when the host app already has react-query configured. */
  queryClient?: QueryClient;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
};

/**
 * The single provider a VDK app needs.
 *
 * Composes react-query → Gear API → accounts → alerts → VDK theme, so consumers wrap once
 * instead of stacking five providers by hand.
 */
export function VdkProvider({
  appName = "Vara dApp",
  network = "mainnet",
  theme,
  colorScheme = "light",
  queryClient,
  className,
  style,
  children,
}: VdkProviderProps) {
  const client = useMemo(() => queryClient ?? new QueryClient(), [queryClient]);
  const { endpoint } = resolveNetwork(network);

  // Keyed on the endpoint so switching networks through props re-initialises the API cleanly.
  const initialArgs = useMemo(() => ({ endpoint }), [endpoint]);

  return (
    <QueryClientProvider client={client}>
      <ApiProvider key={endpoint} initialArgs={initialArgs}>
        <AccountProvider appName={appName}>
          <AlertProvider template={AlertTemplate}>
            <VdkThemeProvider
              theme={theme}
              colorScheme={colorScheme}
              className={className}
              style={style}
            >
              {children}
            </VdkThemeProvider>
          </AlertProvider>
        </AccountProvider>
      </ApiProvider>
    </QueryClientProvider>
  );
}
