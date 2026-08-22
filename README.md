# VDK — Vara Development Kit

Themeable React components for [Vara Network](https://vara.network), plus a live playground
where you pick the colors, see the result, and copy the code.

Think `@coinbase/cdp-react` + the CDP theme docs, for Vara.

```tsx
import { ConnectWalletButton, VdkProvider, createTheme } from "@vara-dk/react";
import "@vara-dk/react/styles.css";

const theme = createTheme({ colors: { primary: "#7c6cff" } });

<VdkProvider appName="My dApp" network="mainnet" theme={theme}>
  <ConnectWalletButton />
</VdkProvider>;
```

## Why this exists

Vara already has the logic layer — [`@gear-js/api`](https://www.npmjs.com/package/@gear-js/api),
[`@gear-js/react-hooks`](https://www.npmjs.com/package/@gear-js/react-hooks),
[`sails-js`](https://www.npmjs.com/package/sails-js) — and a branded component library,
[`@gear-js/vara-ui`](https://www.npmjs.com/package/@gear-js/vara-ui). What was missing:

- `@gear-js/vara-ui` hardcodes the Vara palette; its only theming knob is a `body.dark-theme`
  class. You cannot make it look like *your* product.
- `@gear-js/wallet-connect`'s `theme` prop accepts exactly two values: `"gear"` or `"vara"`.
- Nothing lets a developer try a color scheme, see it applied to a real wallet flow, and copy
  working code out.

VDK is built on the Gear hooks for all chain access — it replaces none of them — and adds a
token-driven design layer plus the playground on top.

## Packages

| Package | What it is |
|---|---|
| `@vara-dk/theme` | The token contract: `VdkTheme`, `createTheme`, presets, `themeToCssVars`, `serializeTheme` |
| `@vara-dk/react` | `VdkProvider` and every component |
| `apps/playground` | The live theme playground (Vite SPA) |
| `examples/vite-basic` | Smallest complete consumer app |

## Components

**Wallet** — `ConnectWalletButton`, `WalletModal`, `AccountDropdown`, `Balance`, `Identicon`
Supports Polkadot{.js}, SubWallet, Talisman, Enkrypt, Nova and Varan; uninstalled extensions
stay listed with an install link instead of silently disappearing.

**Programs** — `TransactionButton`, `ProgramQuery`, `ConfirmDialog`, `useTxToast`, `useSailsProgram`
`TransactionButton` prepares a sails message (which yields the fee estimate), optionally shows
it for confirmation, signs, sends, and reports the outcome as a single toast. `ProgramQuery` is
the read half: it runs a sails query and renders the decoded value, optionally re-reading
whenever the program's state changes on chain.

`useSailsProgram` builds a working sails client at runtime from a program ID and an IDL string
— no codegen step, no generated class in your repo. That is what lets a UI accept a contract
address from the user and immediately read from and write to it:

```tsx
const { program, services } = useSailsProgram({ programId, idl });

<ProgramQuery program={program} serviceName="Vft" functionName="BalanceOf" args={[address]} watch />
<TransactionButton program={program} serviceName="Vft" functionName="Mint" args={[to, amount]} confirm>
  Mint
</TransactionButton>
```

Sails needs the IDL as well as the address — a program's services, functions and argument types
are not recoverable from an on-chain address alone. `services` gives you the parsed list, which
is how the playground builds its service/function/argument controls.

**Network** — `NetworkSwitcher`, `NodeStatus`

**Primitives** — `Button`, `Input`, `Select`, `Card`, `Modal`, `Badge`, `Spinner`, `Skeleton`

## Theming

Every token becomes a CSS custom property (`--vdk-color-primary`, `--vdk-radius-md`, …) on the
provider's wrapper element. Components reference only those variables — there is not a single
literal color in the component stylesheets, and `pnpm lint:tokens` fails the build if one
appears. That invariant is what makes a theme swap total and instant.

```ts
import { createTheme } from "@vara-dk/theme";

export const theme = createTheme({
  colors: { primary: "#ff6b35", primaryForeground: "#ffffff" },
  radius: { md: "4px" },
  typography: { fontFamily: "Inter, sans-serif" },
});
```

Partial themes merge over the light or dark base depending on `colorScheme`, so one override
object works in both schemes. Presets: `vara`, `varaDark`, `midnight`, `sunset`, `mono`.

## Local development

Node 20+ and pnpm (`corepack enable pnpm`).

```bash
pnpm install
pnpm build          # both packages
pnpm dev            # playground on http://localhost:5173/vdk/
pnpm test           # unit + component + registry tests
pnpm lint:tokens    # no literal colors in component CSS
```

## Playground

Three panes: component list, live preview with prop controls, theme editor. The code panel
below emits three snippets — the component usage for the current props, a `createTheme` call
containing only the tokens you changed, and the provider setup. "Share theme" copies a URL
with the whole theme encoded in it.

Deploy with `pnpm --filter @vara-dk/playground build` (set `VDK_BASE` if not hosting at `/vdk/`).

## License

MIT
