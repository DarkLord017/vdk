import {
  Badge,
  Card,
  ConnectWalletButton,
  NetworkSwitcher,
  NodeStatus,
  VdkProvider,
} from "@vara-dk/react";
import "@vara-dk/react/styles.css";

import { theme } from "./theme.js";

/**
 * The smallest complete VDK app: one provider, the connect button, and live node state.
 * Used to confirm a theme copied out of the playground renders identically here.
 */
export function App() {
  return (
    <VdkProvider appName="VDK Example" network="testnet" theme={theme}>
      <main
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 24,
          maxWidth: 560,
          margin: "0 auto",
          padding: 48,
        }}
      >
        <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h1 style={{ margin: 0, fontSize: 22 }}>VDK example</h1>
          <ConnectWalletButton />
        </header>

        <Card title="Network" description="Live connection to a Vara node">
          <NodeStatus />
          <NetworkSwitcher />
        </Card>

        <Card title="Theme" description="Every component below reads the same tokens">
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Badge tone="primary">primary</Badge>
            <Badge tone="success">success</Badge>
            <Badge tone="warning">warning</Badge>
            <Badge tone="danger">danger</Badge>
            <Badge tone="outline">outline</Badge>
          </div>
        </Card>
      </main>
    </VdkProvider>
  );
}
