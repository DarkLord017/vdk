import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";

import { cx } from "../utils/cx.js";
import styles from "./button.module.css";
import { Spinner } from "./spinner.js";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Shows a spinner and blocks interaction, keeping the button's width stable. */
  isLoading?: boolean;
  /** Rendered before the label. */
  icon?: ReactNode;
  block?: boolean;
  children?: ReactNode;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = "primary",
    size = "md",
    isLoading = false,
    icon,
    block = false,
    className,
    disabled,
    children,
    ...props
  },
  ref,
) {
  return (
    <button
      {...props}
      ref={ref}
      type={props.type ?? "button"}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      className={cx(
        styles.button,
        styles[variant],
        styles[size],
        block && styles.block,
        isLoading && styles.loading,
        className,
      )}
    >
      {icon}
      {children}
      {isLoading && (
        <span className={styles.spinner}>
          <Spinner size={size} />
        </span>
      )}
    </button>
  );
});
