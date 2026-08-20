import type { ReactNode } from "react";

import { Button } from "../primitives/button.js";
import { Modal } from "../primitives/modal.js";
import styles from "./confirm-dialog.module.css";

export type ConfirmRow = {
  label: string;
  value: ReactNode;
};

export type ConfirmDialogProps = {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  /** Key/value summary — VDK's transaction flow puts the estimated fee here. */
  rows?: ConfirmRow[];
  confirmLabel?: string;
  cancelLabel?: string;
  isPending?: boolean;
  children?: ReactNode;
};

/** Last check before a signature is requested. */
export function ConfirmDialog({
  isOpen,
  onCancel,
  onConfirm,
  title = "Confirm transaction",
  description,
  rows,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  isPending = false,
  children,
}: ConfirmDialogProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title={title}
      description={description}
      footer={
        <>
          <Button variant="ghost" onClick={onCancel} disabled={isPending}>
            {cancelLabel}
          </Button>

          <Button onClick={onConfirm} isLoading={isPending}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      {rows && rows.length > 0 && (
        <div className={styles.rows}>
          {rows.map((row) => (
            <div className={styles.row} key={row.label}>
              <span className={styles.key}>{row.label}</span>
              <span className={styles.value}>{row.value}</span>
            </div>
          ))}
        </div>
      )}

      {children}
    </Modal>
  );
}
