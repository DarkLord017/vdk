import { useAccount, type Account } from "@gear-js/react-hooks";
import { useMemo, useState } from "react";

import { Badge } from "../primitives/badge.js";
import { Button } from "../primitives/button.js";
import { Modal } from "../primitives/modal.js";
import { truncateAddress } from "../utils/address.js";
import { cx } from "../utils/cx.js";
import { Identicon } from "./identicon.js";
import styles from "./wallet-modal.module.css";
import { WALLETS, WalletMark, type WalletIconOverrides, type WalletId } from "./wallets.js";

export type WalletModalProps = {
  isOpen: boolean;
  onClose: () => void;
  /** Replace the built-in stylised marks with your own artwork. */
  icons?: WalletIconOverrides;
  onConnect?: (account: Account) => void;
};

/**
 * Two-step connect flow: pick an extension, then pick one of its accounts. Extensions that
 * aren't installed stay visible with an install link rather than being hidden, which is the
 * difference between "no wallets found" and a usable prompt.
 */
export function WalletModal({ isOpen, onClose, icons, onConnect }: WalletModalProps) {
  const { wallets, account, login, logout } = useAccount();
  const [selectedId, setSelectedId] = useState<WalletId | null>(null);

  const selectedWallet = selectedId ? wallets?.[selectedId] : undefined;
  const accounts = selectedWallet?.accounts;

  const items = useMemo(
    () =>
      WALLETS.map((meta) => {
        const injected = wallets?.[meta.id];

        return {
          meta,
          isInstalled: Boolean(injected),
          accountsCount: injected?.accounts?.length ?? 0,
          connect: injected?.connect,
        };
      }).sort((a, b) => Number(b.isInstalled) - Number(a.isInstalled)),
    [wallets],
  );

  const close = () => {
    setSelectedId(null);
    onClose();
  };

  const onWalletClick = async (id: WalletId, connect?: () => Promise<void>) => {
    setSelectedId(id);
    // Extensions only expose accounts after the user authorizes the dApp.
    if (connect) await connect();
  };

  const onAccountClick = (nextAccount: Account) => {
    login(nextAccount);
    onConnect?.(nextAccount);
    close();
  };

  if (selectedId && selectedWallet) {
    const meta = WALLETS.find((wallet) => wallet.id === selectedId);

    return (
      <Modal
        isOpen={isOpen}
        onClose={close}
        title={meta?.name ?? "Accounts"}
        description="Choose the account to use in this dApp."
      >
        <Button variant="ghost" size="sm" className={styles.back} onClick={() => setSelectedId(null)}>
          ← All wallets
        </Button>

        {accounts && accounts.length > 0 ? (
          <ul className={styles.list}>
            {accounts.map((walletAccount) => {
              const isActive = walletAccount.address === account?.address;

              return (
                <li key={walletAccount.address}>
                  <button
                    type="button"
                    className={cx(styles.row, isActive && styles.rowActive)}
                    onClick={() => onAccountClick(walletAccount)}
                  >
                    <Identicon address={walletAccount.address} size={28} />

                    <span className={styles.rowMain}>
                      <span className={styles.rowTitle}>{walletAccount.meta.name}</span>
                      <span className={styles.address}>
                        {truncateAddress(walletAccount.address, 8, 8)}
                      </span>
                    </span>

                    {isActive && <Badge tone="primary">Active</Badge>}
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className={styles.empty}>
            No accounts authorized for this site. Approve access in the extension, then reopen
            this dialog.
          </p>
        )}

        {account && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              logout();
              close();
            }}
          >
            Disconnect
          </Button>
        )}
      </Modal>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={close}
      title="Connect wallet"
      description="Connect a Substrate wallet to use this Vara dApp."
    >
      <ul className={styles.list}>
        {items.map(({ meta, isInstalled, accountsCount, connect }) => (
          <li key={meta.id}>
            {isInstalled ? (
              <button
                type="button"
                className={styles.row}
                onClick={() => void onWalletClick(meta.id, connect)}
              >
                {icons?.[meta.id] ?? <WalletMark wallet={meta} />}

                <span className={styles.rowMain}>
                  <span className={styles.rowTitle}>{meta.name}</span>
                  <span className={styles.rowMeta}>
                    {accountsCount > 0
                      ? `${accountsCount} account${accountsCount === 1 ? "" : "s"}`
                      : "Authorize to see accounts"}
                  </span>
                </span>

                <Badge tone="success">Detected</Badge>
              </button>
            ) : (
              <div className={styles.row}>
                {icons?.[meta.id] ?? <WalletMark wallet={meta} />}

                <span className={styles.rowMain}>
                  <span className={styles.rowTitle}>{meta.name}</span>
                  <span className={styles.rowMeta}>Not installed</span>
                </span>

                <a
                  className={styles.install}
                  href={meta.installUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Install ↗
                </a>
              </div>
            )}
          </li>
        ))}
      </ul>
    </Modal>
  );
}
