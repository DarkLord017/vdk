/** Networks VDK knows about out of the box. */
export const NETWORKS = {
  mainnet: {
    id: "mainnet",
    label: "Vara Mainnet",
    endpoint: "wss://rpc.vara.network",
  },
  testnet: {
    id: "testnet",
    label: "Vara Testnet",
    endpoint: "wss://testnet.vara.network",
  },
  local: {
    id: "local",
    label: "Local node",
    endpoint: "ws://localhost:9944",
  },
} as const;

export type NetworkId = keyof typeof NETWORKS;

export type NetworkConfig = {
  id: string;
  label: string;
  endpoint: string;
};

/** What `<VdkProvider network>` accepts: a known id, or a custom endpoint. */
export type NetworkInput = NetworkId | NetworkConfig;

export function resolveNetwork(input: NetworkInput = "mainnet"): NetworkConfig {
  return typeof input === "string" ? NETWORKS[input] : input;
}

export const networkList: NetworkConfig[] = Object.values(NETWORKS);
