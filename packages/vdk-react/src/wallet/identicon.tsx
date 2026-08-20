import { polkadotIcon } from "@polkadot/ui-shared";
import { useMemo } from "react";

import { cx } from "../utils/cx.js";
import styles from "./identicon.module.css";

export type IdenticonProps = {
  address: string;
  size?: number;
  /** Draw a themed ring around the icon. */
  ring?: boolean;
  className?: string;
};

/**
 * Polkadot identicon rendered from `@polkadot/ui-shared` circle data, so the only dependency
 * is the geometry helper rather than the full react-identicon stack.
 */
export function Identicon({ address, size = 28, ring = false, className }: IdenticonProps) {
  const circles = useMemo(() => {
    try {
      return polkadotIcon(address, { isAlternative: false });
    } catch {
      return [];
    }
  }, [address]);

  if (circles.length === 0) {
    return (
      <span
        className={cx(styles.fallback, ring && styles.ring, className)}
        style={{ width: size, height: size }}
        aria-hidden="true"
      />
    );
  }

  return (
    <svg
      className={cx(ring && styles.ring, className)}
      width={size}
      height={size}
      viewBox="0 0 64 64"
      role="img"
      aria-label={`Identicon for ${address}`}
    >
      {circles.map(({ cx: x, cy, fill, r }, index) => (
        // Circle data has no stable id of its own; index is the only key available.
        <circle key={index} cx={x} cy={cy} r={r} fill={fill} />
      ))}
    </svg>
  );
}
