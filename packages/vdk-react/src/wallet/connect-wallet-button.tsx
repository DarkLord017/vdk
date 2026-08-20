import { useAccount } from "@gear-js/react-hooks";
import { useState } from "react";

import { Button, type ButtonSize, type ButtonVariant } from "../primitives/button.js";
import { AccountDropdown } from "./account-dropdown.js";
import { WalletModal } from "./wallet-modal.js";
import type { WalletIconOverrides } from "./wallets.js";

export type ConnectWalletButtonProps = {
  label?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Show the account balance once connected. */
  showBalance?: boolean;
  block?: boolean;
  icons?: WalletIconOverrides;
  className?: string;
};

/**
 * The one component most dApps need: a connect button that becomes the account control once
 * an account is selected.
 */
export function ConnectWalletButton({
  label = "Connect wallet",
  variant = "primary",
  size = "md",
  showBalance = true,
  block = false,
  icons,
  className,
}: ConnectWalletButtonProps) {
  const { account, isAccountReady } = useAccount();
  const [isOpen, setIsOpen] = useState(false);

  if (!isAccountReady) {
    return (
      <Button variant={variant} size={size} block={block} className={className} isLoading disabled>
        {label}
      </Button>
    );
  }

  if (account) {
    return <AccountDropdown size={size} showBalance={showBalance} className={className} />;
  }

  return (
    <>
      <Button
        variant={variant}
        size={size}
        block={block}
        className={className}
        onClick={() => setIsOpen(true)}
      >
        {label}
      </Button>

      <WalletModal isOpen={isOpen} onClose={() => setIsOpen(false)} icons={icons} />
    </>
  );
}
