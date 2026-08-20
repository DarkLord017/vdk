import { cx } from "../utils/cx.js";
import styles from "./spinner.module.css";

export type SpinnerProps = {
  size?: "sm" | "md" | "lg";
  className?: string;
};

/** Inherits `currentColor`, so it reads correctly on every button variant. */
export function Spinner({ size = "md", className }: SpinnerProps) {
  return (
    <span
      className={cx(styles.spinner, styles[size], className)}
      role="status"
      aria-label="Loading"
    />
  );
}
