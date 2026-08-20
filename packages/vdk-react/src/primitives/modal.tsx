import { useEffect, type MouseEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";

import { useVdkTheme } from "../provider/theme-context.js";
import { cx } from "../utils/cx.js";
import styles from "./modal.module.css";

export type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: ReactNode;
  description?: ReactNode;
  footer?: ReactNode;
  /** Hide the × control when the flow must be completed or cancelled explicitly. */
  hideCloseButton?: boolean;
  className?: string;
  children?: ReactNode;
};

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  footer,
  hideCloseButton = false,
  className,
  children,
}: ModalProps) {
  const { rootElement } = useVdkTheme();

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !rootElement) return null;

  const onOverlayClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) onClose();
  };

  // Portalled into the VDK root, not document.body, so the theme's CSS vars still apply.
  return createPortal(
    <div className={styles.overlay} onClick={onOverlayClick} role="presentation">
      <div className={cx(styles.modal, className)} role="dialog" aria-modal="true">
        {(title || description || !hideCloseButton) && (
          <div className={styles.header}>
            <div className={styles.heading}>
              {title && <h2 className={styles.title}>{title}</h2>}
              {description && <p className={styles.description}>{description}</p>}
            </div>

            {!hideCloseButton && (
              <button type="button" className={styles.close} onClick={onClose} aria-label="Close">
                ×
              </button>
            )}
          </div>
        )}

        {children}

        {footer && <div className={styles.footer}>{footer}</div>}
      </div>
    </div>,
    rootElement,
  );
}
