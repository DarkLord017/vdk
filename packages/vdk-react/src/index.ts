// Provider
export { VdkProvider } from "./provider/vdk-provider.js";
export type { VdkProviderProps } from "./provider/vdk-provider.js";
export { VdkThemeProvider, useVdkTheme } from "./provider/theme-context.js";
export type { VdkThemeProviderProps } from "./provider/theme-context.js";
export { NETWORKS, networkList, resolveNetwork } from "./provider/network.js";
export type { NetworkId, NetworkConfig, NetworkInput } from "./provider/network.js";

// Primitives
export { Button } from "./primitives/button.js";
export type { ButtonProps, ButtonVariant, ButtonSize } from "./primitives/button.js";
export { Input } from "./primitives/input.js";
export type { InputProps } from "./primitives/input.js";
export { Select } from "./primitives/select.js";
export type { SelectProps, SelectOption } from "./primitives/select.js";
export { Card } from "./primitives/card.js";
export type { CardProps } from "./primitives/card.js";
export { Modal } from "./primitives/modal.js";
export type { ModalProps } from "./primitives/modal.js";
export { Badge } from "./primitives/badge.js";
export type { BadgeProps, BadgeTone } from "./primitives/badge.js";
export { Spinner } from "./primitives/spinner.js";
export type { SpinnerProps } from "./primitives/spinner.js";
export { Skeleton } from "./primitives/skeleton.js";
export type { SkeletonProps } from "./primitives/skeleton.js";

// Wallet
export { ConnectWalletButton } from "./wallet/connect-wallet-button.js";
export type { ConnectWalletButtonProps } from "./wallet/connect-wallet-button.js";
export { WalletModal } from "./wallet/wallet-modal.js";
export type { WalletModalProps } from "./wallet/wallet-modal.js";
export { AccountDropdown } from "./wallet/account-dropdown.js";
export type { AccountDropdownProps } from "./wallet/account-dropdown.js";
export { Balance } from "./wallet/balance.js";
export type { BalanceProps } from "./wallet/balance.js";
export { Identicon } from "./wallet/identicon.js";
export type { IdenticonProps } from "./wallet/identicon.js";
export { WALLETS, WALLET_BY_ID, WalletMark } from "./wallet/wallets.js";
export type { WalletId, WalletMeta, WalletIconOverrides } from "./wallet/wallets.js";

// Network
export { NetworkSwitcher } from "./network/network-switcher.js";
export type { NetworkSwitcherProps } from "./network/network-switcher.js";
export { NodeStatus } from "./network/node-status.js";
export type { NodeStatusProps } from "./network/node-status.js";

// Transactions
export { TransactionButton } from "./transaction/transaction-button.js";
export type { TransactionButtonProps } from "./transaction/transaction-button.js";
export { ConfirmDialog } from "./transaction/confirm-dialog.js";
export type { ConfirmDialogProps, ConfirmRow } from "./transaction/confirm-dialog.js";
export { useTxToast } from "./transaction/use-tx-toast.js";
export type { TxToast } from "./transaction/use-tx-toast.js";
export { useSailsProgram } from "./transaction/use-sails-program.js";
export type {
  UseSailsProgramParameters,
  UseSailsProgramResult,
  SailsProgram,
  SailsServiceInfo,
  SailsFunctionInfo,
  SailsArgInfo,
} from "./transaction/use-sails-program.js";

// Program state
export { ProgramQuery, formatValue } from "./program/program-query.js";
export type { ProgramQueryProps } from "./program/program-query.js";

// Feedback
export { AlertTemplate } from "./feedback/alert-template.js";

// Re-exported so consumers can build themes without a second install.
export {
  createTheme,
  defaultTheme,
  darkTheme,
  presets,
  getPreset,
  themeToCssVars,
  themeToCssText,
  serializeTheme,
  diffTheme,
} from "@vara-dk/theme";
export type {
  VdkTheme,
  VdkThemeInput,
  ColorScheme,
  ColorTokens,
  ThemePreset,
  PresetId,
} from "@vara-dk/theme";
