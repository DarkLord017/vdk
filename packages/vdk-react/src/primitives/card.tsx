import type { HTMLAttributes, ReactNode } from "react";

import { cx } from "../utils/cx.js";
import styles from "./card.module.css";

export type CardProps = HTMLAttributes<HTMLDivElement> & {
  title?: ReactNode;
  description?: ReactNode;
  variant?: "default" | "flat" | "elevated";
  children?: ReactNode;
};

export function Card({
  title,
  description,
  variant = "default",
  className,
  children,
  ...props
}: CardProps) {
  return (
    <div
      {...props}
      className={cx(styles.card, variant !== "default" && styles[variant], className)}
    >
      {(title || description) && (
        <div className={styles.header}>
          {title && <h3 className={styles.title}>{title}</h3>}
          {description && <p className={styles.description}>{description}</p>}
        </div>
      )}

      {children}
    </div>
  );
}
