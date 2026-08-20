import { useAlert } from "@gear-js/react-hooks";
import { useCallback, useRef } from "react";

export type TxToast = {
  /** Opens (or reuses) the pending toast for this transaction. */
  pending: (message?: string) => void;
  success: (message?: string) => void;
  error: (message: string) => void;
};

/**
 * Thin wrapper over `useAlert` that keeps one toast per transaction: the pending toast is
 * replaced in place by the success or error result instead of stacking three toasts.
 */
export function useTxToast(): TxToast {
  const alert = useAlert();
  const pendingId = useRef<string | undefined>(undefined);

  const dismissPending = useCallback(() => {
    if (!pendingId.current) return;
    alert.remove(pendingId.current);
    pendingId.current = undefined;
  }, [alert]);

  const pending = useCallback(
    (message = "Waiting for signature…") => {
      dismissPending();
      pendingId.current = alert.loading(message);
    },
    [alert, dismissPending],
  );

  const success = useCallback(
    (message = "Transaction finalized") => {
      dismissPending();
      alert.success(message);
    },
    [alert, dismissPending],
  );

  const error = useCallback(
    (message: string) => {
      dismissPending();
      alert.error(message);
    },
    [alert, dismissPending],
  );

  return { pending, success, error };
}
