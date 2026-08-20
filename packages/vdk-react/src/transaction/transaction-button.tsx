import {
  useAccount,
  useApi,
  useBalanceFormat,
  usePrepareProgramTransaction,
  useSendProgramTransaction,
} from "@gear-js/react-hooks";
import { useState, type ReactNode } from "react";

import { Button, type ButtonSize, type ButtonVariant } from "../primitives/button.js";
import { ConfirmDialog } from "./confirm-dialog.js";
import { useTxToast } from "./use-tx-toast.js";

/** Service keys of a sails program, minus the plumbing the generated client exposes. */
type ServiceKeys<TProgram> = Exclude<
  keyof TProgram,
  "api" | "registry" | "programId" | "newCtorFromCode" | "newCtorFromCodeId"
>;

export type TransactionButtonProps<TProgram> = {
  /** A sails-js program client, typically from `useProgram`. */
  program: TProgram | undefined;
  serviceName: ServiceKeys<TProgram>;
  functionName: string;
  args?: unknown[];
  /** Value attached to the message, in the chain's smallest unit. */
  value?: bigint;
  /** Explicit gas limit; omit to let the node calculate it. */
  gasLimit?: bigint;
  /** Show a fee-estimate dialog before requesting a signature. */
  confirm?: boolean;
  confirmTitle?: string;
  confirmDescription?: string;
  /** Copy for the button while a signature or inclusion is pending. */
  pendingLabel?: string;
  onSuccess?: (result: unknown) => void;
  onError?: (error: Error) => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  block?: boolean;
  disabled?: boolean;
  className?: string;
  children?: ReactNode;
};

/**
 * Sends one sails message and reflects its whole lifecycle in the button.
 *
 * The transaction is always prepared first (which is what yields the fee estimate), then
 * signed and sent. With `confirm`, the fee is shown before the wallet prompt appears.
 */
export function TransactionButton<TProgram>({
  program,
  serviceName,
  functionName,
  args = [],
  value,
  gasLimit,
  confirm = false,
  confirmTitle,
  confirmDescription,
  pendingLabel = "Confirming…",
  onSuccess,
  onError,
  variant = "primary",
  size = "md",
  block = false,
  disabled = false,
  className,
  children = "Send transaction",
}: TransactionButtonProps<TProgram>) {
  const { account } = useAccount();
  const { isApiReady } = useApi();
  const { getFormattedBalance } = useBalanceFormat();
  const toast = useTxToast();

  const [isBusy, setIsBusy] = useState(false);
  const [pending, setPending] = useState<{ transaction: unknown; fee: bigint } | null>(null);

  // The hooks are generic over the sails client's inferred service/function shapes. Those
  // types can't be reconstructed from this component's looser public props, so the boundary
  // is cast once here rather than leaking generics into every call site.
  const params = { program, serviceName, functionName } as never;
  const { prepareTransactionAsync } = usePrepareProgramTransaction(params);
  const { sendTransactionAsync } = useSendProgramTransaction(params);

  const isDisabled = disabled || !account || !isApiReady || !program;

  const signAndSend = async (prepared?: { transaction: unknown }) => {
    setIsBusy(true);
    toast.pending();

    try {
      const options = prepared
        ? { transaction: prepared.transaction }
        : { args, value, gasLimit };

      const result = await sendTransactionAsync(options as never);

      toast.success();
      onSuccess?.(result);
    } catch (cause) {
      const error = cause instanceof Error ? cause : new Error("Transaction failed");
      toast.error(error.message);
      onError?.(error);
    } finally {
      setIsBusy(false);
      setPending(null);
    }
  };

  const onClick = async () => {
    if (isDisabled) return;

    if (!confirm) {
      await signAndSend();
      return;
    }

    setIsBusy(true);

    try {
      const prepared = await prepareTransactionAsync({ args, value, gasLimit } as never);
      setPending(prepared as { transaction: unknown; fee: bigint });
    } catch (cause) {
      const error = cause instanceof Error ? cause : new Error("Failed to prepare transaction");
      toast.error(error.message);
      onError?.(error);
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        block={block}
        className={className}
        disabled={isDisabled}
        isLoading={isBusy}
        onClick={() => void onClick()}
      >
        {isBusy ? pendingLabel : children}
      </Button>

      {confirm && (
        <ConfirmDialog
          isOpen={Boolean(pending)}
          onCancel={() => setPending(null)}
          onConfirm={() => void signAndSend(pending ?? undefined)}
          title={confirmTitle}
          description={confirmDescription}
          isPending={isBusy}
          rows={[
            { label: "Method", value: `${String(serviceName)}.${functionName}` },
            {
              label: "Estimated fee",
              value: pending ? formatFee(pending.fee, getFormattedBalance) : "—",
            },
            ...(value ? [{ label: "Value", value: value.toString() }] : []),
          ]}
        />
      )}
    </>
  );
}

function formatFee(
  fee: bigint,
  getFormattedBalance: (balance: string) => { value: string; unit: string },
): string {
  const { value, unit } = getFormattedBalance(fee.toString());
  return `${value} ${unit}`;
}
