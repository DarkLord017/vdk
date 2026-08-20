import { getVaraAddress, useAccount } from "@gear-js/react-hooks";
import { useEffect, useRef, useState } from "react";

import { Button } from "../primitives/button.js";
import { copyToClipboard, truncateAddress } from "../utils/address.js";
import { cx } from "../utils/cx.js";
import styles from "./account-dropdown.module.css";
import { Balance } from "./balance.js";
import { Identicon } from "./identicon.js";
import { WalletModal } from "./wallet-modal.js";

export type AccountDropdownProps = {
  size?: "sm" | "md" | "lg";
  /** Show the balance inline on the trigger, not only inside the panel. */
  showBalance?: boolean;
  className?: string;
};

/** Connected-state control: identity, balance, copy, switch account, disconnect. */
export function AccountDropdown({
  size = "md",
  showBalance = true,
  className,
}: AccountDropdownProps) {
  const { account, logout } = useAccount();
  const [isOpen, setIsOpen] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const [copied, setCopied] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) setIsOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [isOpen]);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 1600);
    return () => clearTimeout(timer);
  }, [copied]);

  if (!account) return null;

  const varaAddress = getVaraAddress(account.address);

  const onCopy = async () => {
    setCopied(await copyToClipboard(varaAddress));
  };

  return (
    <div className={cx(styles.wrapper, className)} ref={wrapperRef}>
      <button
        type="button"
        className={cx(styles.trigger, size !== "md" && styles[size])}
        onClick={() => setIsOpen((value) => !value)}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Identicon address={account.address} size={size === "sm" ? 18 : 22} />
        <span>{truncateAddress(varaAddress)}</span>

        {showBalance && (
          <>
            <span className={styles.divider} aria-hidden="true" />
            <Balance />
          </>
        )}
      </button>

      {isOpen && (
        <div className={styles.panel}>
          <div className={styles.identity}>
            <Identicon address={account.address} size={40} ring />

            <div className={styles.identityText}>
              <span className={styles.name}>{account.meta.name ?? "Account"}</span>
              <span className={styles.address}>{truncateAddress(varaAddress, 10, 10)}</span>
            </div>
          </div>

          <div className={styles.balanceRow}>
            <span className={styles.balanceLabel}>Balance</span>
            <Balance />
          </div>

          <div className={styles.actions}>
            <Button variant="secondary" size="sm" block onClick={() => void onCopy()}>
              {copied ? "Copied" : "Copy address"}
            </Button>

            <Button
              variant="outline"
              size="sm"
              block
              onClick={() => {
                setIsSwitching(true);
                setIsOpen(false);
              }}
            >
              Switch account
            </Button>

            <Button
              variant="ghost"
              size="sm"
              block
              onClick={() => {
                logout();
                setIsOpen(false);
              }}
            >
              Disconnect
            </Button>
          </div>
        </div>
      )}

      <WalletModal isOpen={isSwitching} onClose={() => setIsSwitching(false)} />
    </div>
  );
}
