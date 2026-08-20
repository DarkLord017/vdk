import type { CSSProperties } from "react";

import { cx } from "../utils/cx.js";
import styles from "./skeleton.module.css";

export type SkeletonProps = {
  width?: number | string;
  height?: number | string;
  className?: string;
  style?: CSSProperties;
};

export function Skeleton({ width = "100%", height = 16, className, style }: SkeletonProps) {
  return (
    <span
      aria-hidden="true"
      className={cx(styles.skeleton, className)}
      style={{ width, height, ...style }}
    />
  );
}
