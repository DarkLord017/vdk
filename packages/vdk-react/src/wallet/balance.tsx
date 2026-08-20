import { useAccount, useBalance, useBalanceFormat } from "@gear-js/react-hooks";

import { Skeleton } from "../primitives/skeleton.js";
import { cx } from "../utils/cx.js";
import styles from "./balance.module.css";

export type BalanceProps = {
  /** Defaults to the connected account. */
  address?: string;
  /** Hide the `VARA`/`TVARA` unit suffix. */
  hideUnit?: boolean;
  className?: string;
};

/** Free balance of an account, formatted in the chain's own units. */
export function Balance({ address, hideUnit = false, className }: BalanceProps) {
  const { account } = useAccount();
  const resolvedAddress = address ?? account?.address;

  const { balance, isBalanceReady } = useBalance(resolvedAddress);
  const { getFormattedBalance } = useBalanceFormat();

  if (!resolvedAddress) return null;
  if (!isBalanceReady || !balance) return <Skeleton width={72} height={14} />;

  const { value, unit } = getFormattedBalance(balance);

  return (
    <span className={cx(styles.balance, className)}>
      <span className={styles.value}>{value}</span>
      {!hideUnit && <span className={styles.unit}>{unit}</span>}
    </span>
  );
}
