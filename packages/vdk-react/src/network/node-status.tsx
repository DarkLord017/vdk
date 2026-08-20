import { useApi } from "@gear-js/react-hooks";

import { cx } from "../utils/cx.js";
import styles from "./node-status.module.css";

export type NodeStatusProps = {
  /** Also print the chain name reported by the node. */
  showChainName?: boolean;
  className?: string;
};

/** Live connection indicator for the node the `ApiProvider` is talking to. */
export function NodeStatus({ showChainName = true, className }: NodeStatusProps) {
  const { api, isApiReady } = useApi();

  const chainName = isApiReady ? api.runtimeChain.toString() : undefined;

  return (
    <span
      className={cx(styles.status, isApiReady ? styles.ready : styles.connecting, className)}
      role="status"
    >
      <span className={styles.dot} aria-hidden="true" />

      {isApiReady ? (
        <span className={styles.label}>{showChainName && chainName ? chainName : "Connected"}</span>
      ) : (
        <span>Connecting…</span>
      )}
    </span>
  );
}
