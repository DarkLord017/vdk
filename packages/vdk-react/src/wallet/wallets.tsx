import type { ReactNode } from "react";

/**
 * Wallet ids match the extension keys `@gear-js/react-hooks` reports on `useAccount().wallets`
 * (which come from `window.injectedWeb3`), so detection lines up with what the hook sees.
 */
export type WalletId = "polkadot-js" | "subwallet-js" | "talisman" | "enkrypt" | "nova" | "varan";

export type WalletMeta = {
  id: WalletId;
  name: string;
  /** Brand color used by the default mark. */
  color: string;
  /** Where to install it when the extension is missing. */
  installUrl: string;
};

export const WALLETS: WalletMeta[] = [
  {
    id: "polkadot-js",
    name: "Polkadot{.js}",
    color: "#e6007a",
    installUrl: "https://polkadot.js.org/extension/",
  },
  {
    id: "subwallet-js",
    name: "SubWallet",
    color: "#004bff",
    installUrl: "https://www.subwallet.app/download.html",
  },
  {
    id: "talisman",
    name: "Talisman",
    color: "#d5ff5c",
    installUrl: "https://talisman.xyz/download",
  },
  {
    id: "enkrypt",
    name: "Enkrypt",
    color: "#794fff",
    installUrl: "https://www.enkrypt.com/download",
  },
  {
    id: "nova",
    name: "Nova Wallet",
    color: "#4f7bff",
    installUrl: "https://novawallet.io/",
  },
  {
    id: "varan",
    name: "Varan",
    color: "#00b4a0",
    installUrl: "https://varan.wallet/",
  },
];

export const WALLET_BY_ID = new Map(WALLETS.map((wallet) => [wallet.id, wallet]));

/**
 * Stylised marks rather than the vendors' trademarked logos. Pass `icons` to
 * `<WalletModal />` or `<ConnectWalletButton />` to swap in official artwork.
 */
export function WalletMark({ wallet, size = 28 }: { wallet: WalletMeta; size?: number }) {
  if (wallet.id === "polkadot-js") return <PolkadotMark size={size} color={wallet.color} />;

  const initial = wallet.name.replace(/[^A-Za-z]/g, "").charAt(0).toUpperCase();

  return (
    <svg width={size} height={size} viewBox="0 0 32 32" role="img" aria-label={wallet.name}>
      <rect width="32" height="32" rx="9" fill={wallet.color} />
      <text
        x="16"
        y="21"
        textAnchor="middle"
        fontSize="15"
        fontWeight="700"
        fontFamily="var(--vdk-font-family)"
        fill={isLight(wallet.color) ? "#111111" : "#ffffff"}
      >
        {initial}
      </text>
    </svg>
  );
}

function PolkadotMark({ size, color }: { size: number; color: string }) {
  const dots = [
    [16, 6],
    [24.7, 11],
    [24.7, 21],
    [16, 26],
    [7.3, 21],
    [7.3, 11],
  ];

  return (
    <svg width={size} height={size} viewBox="0 0 32 32" role="img" aria-label="Polkadot{.js}">
      <rect width="32" height="32" rx="9" fill="#ffffff" stroke={color} strokeOpacity="0.25" />
      {dots.map(([cx, cy]) => (
        <ellipse key={`${cx}-${cy}`} cx={cx} cy={cy} rx="3.6" ry="2.6" fill={color} />
      ))}
    </svg>
  );
}

/** Rough luminance check, only good enough to pick black or white text on a brand color. */
function isLight(hex: string): boolean {
  const value = hex.replace("#", "");
  const r = Number.parseInt(value.slice(0, 2), 16);
  const g = Number.parseInt(value.slice(2, 4), 16);
  const b = Number.parseInt(value.slice(4, 6), 16);

  return (r * 299 + g * 587 + b * 114) / 1000 > 160;
}

export type WalletIconOverrides = Partial<Record<WalletId, ReactNode>>;
