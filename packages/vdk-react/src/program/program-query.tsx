import { useProgramQuery } from "@gear-js/react-hooks";
import type { ReactNode } from "react";

import { Skeleton } from "../primitives/skeleton.js";
import { cx } from "../utils/cx.js";
import type { SailsProgram } from "../transaction/use-sails-program.js";
import styles from "./program-query.module.css";

export type ProgramQueryProps = {
  /** A sails client — from `useProgram`, or `useSailsProgram` for a runtime-loaded one. */
  program: SailsProgram | undefined;
  serviceName: string;
  functionName: string;
  args?: unknown[];
  /** Heading above the value. Defaults to `Service.function`. */
  label?: ReactNode;
  /** Re-run the query whenever the program's state changes on chain. */
  watch?: boolean;
  /** Render the decoded result yourself; by default it is pretty-printed. */
  format?: (value: unknown) => ReactNode;
  /** Hide the manual refresh control (pointless when `watch` is on). */
  hideRefresh?: boolean;
  className?: string;
};

/**
 * Reads state from a program and renders the decoded result.
 *
 * The write half of a dApp is `TransactionButton`; this is the read half. Both accept the
 * same runtime-built client, so a UI that takes a contract address from the user can query
 * it without any generated code.
 */
export function ProgramQuery({
  program,
  serviceName,
  functionName,
  args = [],
  label,
  watch = false,
  format,
  hideRefresh = false,
  className,
}: ProgramQueryProps) {
  const isEnabled = Boolean(program);

  const { data, error, isFetching, refetch } = useProgramQuery({
    program,
    serviceName,
    functionName,
    args,
    watch,
    query: { enabled: isEnabled },
  } as never) as {
    data: unknown;
    error: Error | null;
    isFetching: boolean;
    refetch: () => void;
  };

  const hasValue = data !== undefined;

  return (
    <div className={cx(styles.query, className)}>
      <div className={styles.head}>
        <span className={styles.label}>{label ?? `${serviceName}.${functionName}`}</span>

        <span className={styles.actions}>
          {watch && (
            <span className={styles.live}>
              <span className={styles.dot} aria-hidden="true" />
              live
            </span>
          )}

          {!hideRefresh && !watch && (
            <button
              type="button"
              className={styles.refresh}
              onClick={() => refetch()}
              disabled={!isEnabled || isFetching}
            >
              Refresh
            </button>
          )}
        </span>
      </div>

      {!isEnabled ? (
        <p className={styles.idle}>No program loaded</p>
      ) : error ? (
        <p className={styles.error}>{error.message}</p>
      ) : !hasValue && isFetching ? (
        <Skeleton width="60%" height={18} />
      ) : hasValue ? (
        <p className={styles.value}>{format ? format(data) : formatValue(data)}</p>
      ) : (
        <p className={styles.idle}>No value</p>
      )}
    </div>
  );
}

/**
 * Decoded sails values are plain JS, but they carry bigints, which `JSON.stringify` throws
 * on — the single most likely way this component could crash on a real program.
 */
export function formatValue(value: unknown): string {
  if (value === null || value === undefined) return "null";
  if (typeof value === "bigint") return value.toString();
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);

  return JSON.stringify(value, (_key, item) => (typeof item === "bigint" ? item.toString() : item), 2);
}
