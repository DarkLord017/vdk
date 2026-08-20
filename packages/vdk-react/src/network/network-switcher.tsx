import { useApi } from "@gear-js/react-hooks";
import { useState } from "react";

import { Button } from "../primitives/button.js";
import { Input } from "../primitives/input.js";
import { Select } from "../primitives/select.js";
import { networkList, type NetworkConfig } from "../provider/network.js";
import { cx } from "../utils/cx.js";
import styles from "./network-switcher.module.css";

const CUSTOM = "custom";

export type NetworkSwitcherProps = {
  /** Restrict the list; defaults to mainnet, testnet and a local node. */
  networks?: NetworkConfig[];
  /** Offer a free-form RPC endpoint. */
  allowCustom?: boolean;
  onSwitch?: (endpoint: string) => void;
  className?: string;
};

/** Switches the live `ApiProvider` connection via its `switchNetwork`. */
export function NetworkSwitcher({
  networks = networkList,
  allowCustom = true,
  onSwitch,
  className,
}: NetworkSwitcherProps) {
  const { switchNetwork, isApiReady } = useApi();
  const [selected, setSelected] = useState(networks[0]?.id ?? CUSTOM);
  const [customEndpoint, setCustomEndpoint] = useState("");
  const [isSwitching, setIsSwitching] = useState(false);
  const [error, setError] = useState<string>();

  const options = [
    ...networks.map(({ id, label }) => ({ value: id, label })),
    ...(allowCustom ? [{ value: CUSTOM, label: "Custom RPC…" }] : []),
  ];

  const connect = async (endpoint: string) => {
    setIsSwitching(true);
    setError(undefined);

    try {
      await switchNetwork({ endpoint });
      onSwitch?.(endpoint);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Failed to connect");
    } finally {
      setIsSwitching(false);
    }
  };

  const onSelect = (value: string) => {
    setSelected(value);
    if (value === CUSTOM) return;

    const network = networks.find((item) => item.id === value);
    if (network) void connect(network.endpoint);
  };

  return (
    <div className={cx(styles.switcher, className)}>
      <Select
        aria-label="Network"
        options={options}
        value={selected}
        disabled={isSwitching || !isApiReady}
        onChange={(event) => onSelect(event.target.value)}
      />

      {selected === CUSTOM && (
        <div className={styles.custom}>
          <Input
            className={styles.customInput}
            placeholder="wss://my-node.example"
            value={customEndpoint}
            error={error}
            onChange={(event) => setCustomEndpoint(event.target.value)}
          />

          <Button
            size="md"
            isLoading={isSwitching}
            disabled={!customEndpoint}
            onClick={() => void connect(customEndpoint)}
          >
            Connect
          </Button>
        </div>
      )}
    </div>
  );
}
