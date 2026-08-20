import type { HTMLAttributes, ReactNode } from "react";

import { cx } from "../utils/cx.js";
import styles from "./badge.module.css";

export type BadgeTone = "neutral" | "primary" | "success" | "warning" | "danger" | "outline";

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: BadgeTone;
  children: ReactNode;
};

export function Badge({ tone = "neutral", className, children, ...props }: BadgeProps) {
  return (
    <span {...props} className={cx(styles.badge, styles[tone], className)}>
      {children}
    </span>
  );
}
