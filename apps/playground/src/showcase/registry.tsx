import { useAccount } from "@gear-js/react-hooks";
import {
  AccountDropdown,
  Badge,
  Balance,
  Button,
  Card,
  ConfirmDialog,
  ConnectWalletButton,
  Identicon,
  Input,
  Modal,
  NetworkSwitcher,
  NodeStatus,
  Select,
  Skeleton,
  Spinner,
  WalletModal,
  useTxToast,
} from "@vara-dk/react";
import { useState } from "react";

import { getProgramConfig } from "../state/program-store.js";
import { jsx } from "./code.js";
import { ProgramDemo, programUsageCode } from "./program-demo.js";
import type { Showcase, ShowcaseProps } from "./types.js";

const DEMO_ADDRESS = "kGkLEU3e3XXkJp2WK4eNpVmSab5xUNL9QtmLPh8QfCL2EgotW";

const str = (props: ShowcaseProps, key: string, fallback = "") =>
  typeof props[key] === "string" ? (props[key] as string) : fallback;
const bool = (props: ShowcaseProps, key: string) => props[key] === true;

export const showcases: Showcase[] = [
  {
    id: "connect-wallet-button",
    group: "Wallet",
    name: "ConnectWalletButton",
    description:
      "Connect button that becomes the account control once an account is selected. The whole wallet flow in one element.",
    note: "Live against Vara testnet — with a Substrate extension installed, this really connects.",
    controls: [
      { type: "text", id: "label", label: "Label", defaultValue: "Connect wallet" },
      {
        type: "select",
        id: "variant",
        label: "Variant",
        options: ["primary", "secondary", "outline", "ghost", "danger"],
        defaultValue: "primary",
      },
      {
        type: "select",
        id: "size",
        label: "Size",
        options: ["sm", "md", "lg"],
        defaultValue: "md",
      },
      { type: "boolean", id: "showBalance", label: "Show balance", defaultValue: true },
      { type: "boolean", id: "block", label: "Full width", defaultValue: false },
    ],
    Demo: ({ props }) => (
      <ConnectWalletButton
        label={str(props, "label", "Connect wallet")}
        variant={str(props, "variant", "primary") as "primary"}
        size={str(props, "size", "md") as "md"}
        showBalance={bool(props, "showBalance")}
        block={bool(props, "block")}
      />
    ),
    code: (props) =>
      jsx(
        "ConnectWalletButton",
        {
          label: str(props, "label"),
          variant: str(props, "variant"),
          size: str(props, "size"),
          showBalance: bool(props, "showBalance"),
          block: bool(props, "block"),
        },
        {
          defaults: {
            label: "Connect wallet",
            variant: "primary",
            size: "md",
            showBalance: true,
            block: false,
          },
        },
      ),
  },
  {
    id: "wallet-modal",
    group: "Wallet",
    name: "WalletModal",
    description:
      "Two-step connect dialog: pick an extension, then an account. Missing extensions stay listed with an install link.",
    controls: [],
    Demo: () => {
      const [isOpen, setIsOpen] = useState(false);

      return (
        <>
          <Button onClick={() => setIsOpen(true)}>Open wallet modal</Button>
          <WalletModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
        </>
      );
    },
    code: () =>
      [
        "const [isOpen, setIsOpen] = useState(false);",
        "",
        '<Button onClick={() => setIsOpen(true)}>Connect</Button>',
        "<WalletModal isOpen={isOpen} onClose={() => setIsOpen(false)} />",
      ].join("\n"),
  },
  {
    id: "account-dropdown",
    group: "Wallet",
    name: "AccountDropdown",
    description:
      "Connected-state control: identicon, address, balance, copy, switch account, disconnect.",
    note: "Requires a connected account — connect one from the ConnectWalletButton demo first.",
    controls: [
      {
        type: "select",
        id: "size",
        label: "Size",
        options: ["sm", "md", "lg"],
        defaultValue: "md",
      },
      { type: "boolean", id: "showBalance", label: "Show balance", defaultValue: true },
    ],
    Demo: ({ props }) => {
      const { account } = useAccount();

      if (!account) return <ConnectWalletButton label="Connect to preview" />;

      return (
        <AccountDropdown
          size={str(props, "size", "md") as "md"}
          showBalance={bool(props, "showBalance")}
        />
      );
    },
    code: (props) =>
      jsx(
        "AccountDropdown",
        { size: str(props, "size"), showBalance: bool(props, "showBalance") },
        { defaults: { size: "md", showBalance: true } },
      ),
  },
  {
    id: "balance",
    group: "Wallet",
    name: "Balance",
    description: "Free balance of an account, formatted in the chain's own units.",
    controls: [{ type: "boolean", id: "hideUnit", label: "Hide unit", defaultValue: false }],
    Demo: ({ props }) => <Balance address={DEMO_ADDRESS} hideUnit={bool(props, "hideUnit")} />,
    code: (props) =>
      jsx("Balance", { hideUnit: bool(props, "hideUnit") }, { defaults: { hideUnit: false } }),
  },
  {
    id: "identicon",
    group: "Wallet",
    name: "Identicon",
    description: "Polkadot identicon with an optional themed ring.",
    controls: [
      {
        type: "select",
        id: "size",
        label: "Size",
        options: ["24", "32", "48", "64"],
        defaultValue: "48",
      },
      { type: "boolean", id: "ring", label: "Ring", defaultValue: true },
    ],
    Demo: ({ props }) => (
      <Identicon
        address={DEMO_ADDRESS}
        size={Number(str(props, "size", "48"))}
        ring={bool(props, "ring")}
      />
    ),
    code: (props) =>
      jsx(
        "Identicon",
        {
          address: "kGkLEU3e…EgotW",
          size: Number(str(props, "size", "48")),
          ring: bool(props, "ring"),
        },
        { defaults: { ring: false } },
      ),
  },

  {
    id: "transaction-button",
    group: "Transactions",
    name: "TransactionButton",
    description:
      "Sends one sails message: prepares it, shows the fee, requests the signature, then reports the result as a toast.",
    note:
      "Paste a program ID and its IDL to make this live on Vara testnet. Sails needs the IDL as well as the address — a program's services and argument types aren't recoverable from the address alone.",
    controls: [
      { type: "text", id: "label", label: "Label", defaultValue: "Send message" },
      { type: "boolean", id: "confirm", label: "Confirm dialog", defaultValue: true },
      {
        type: "select",
        id: "variant",
        label: "Variant",
        options: ["primary", "secondary", "outline", "ghost", "danger"],
        defaultValue: "primary",
      },
    ],
    Demo: ({ props }) => (
      <ProgramDemo
        label={str(props, "label", "Send message")}
        variant={str(props, "variant", "primary") as "primary"}
        confirm={bool(props, "confirm")}
      />
    ),
    code: (props) =>
      programUsageCode(getProgramConfig(), {
        label: str(props, "label", "Send message"),
        variant: str(props, "variant", "primary") as "primary",
        confirm: bool(props, "confirm"),
      }),
  },
  {
    id: "confirm-dialog",
    group: "Transactions",
    name: "ConfirmDialog",
    description: "Last check before a signature: method, estimated fee, attached value.",
    controls: [
      { type: "text", id: "title", label: "Title", defaultValue: "Confirm transaction" },
      { type: "text", id: "confirmLabel", label: "Confirm label", defaultValue: "Confirm" },
    ],
    Demo: ({ props }) => {
      const [isOpen, setIsOpen] = useState(false);

      return (
        <>
          <Button onClick={() => setIsOpen(true)}>Open confirm dialog</Button>

          <ConfirmDialog
            isOpen={isOpen}
            onCancel={() => setIsOpen(false)}
            onConfirm={() => setIsOpen(false)}
            title={str(props, "title", "Confirm transaction")}
            confirmLabel={str(props, "confirmLabel", "Confirm")}
            description="This transaction will be signed by your wallet."
            rows={[
              { label: "Method", value: "Vft.mint" },
              { label: "Estimated fee", value: "0.0021 VARA" },
            ]}
          />
        </>
      );
    },
    code: (props) =>
      jsx(
        "ConfirmDialog",
        {
          isOpen: "{isOpen}",
          title: str(props, "title"),
          confirmLabel: str(props, "confirmLabel"),
        },
        { defaults: { title: "Confirm transaction", confirmLabel: "Confirm" } },
      )
        .replace('isOpen="{isOpen}"', "isOpen={isOpen}")
        .replace("/>", "\n  onCancel={close}\n  onConfirm={send}\n  rows={rows}\n/>"),
  },
  {
    id: "tx-toast",
    group: "Transactions",
    name: "useTxToast",
    description:
      "One toast per transaction: the pending toast is replaced in place by the result instead of stacking.",
    controls: [],
    Demo: () => {
      const toast = useTxToast();

      return (
        <div style={{ display: "flex", gap: 8 }}>
          <Button size="sm" variant="outline" onClick={() => toast.pending()}>
            Pending
          </Button>
          <Button size="sm" variant="outline" onClick={() => toast.success()}>
            Success
          </Button>
          <Button size="sm" variant="outline" onClick={() => toast.error("Transaction failed")}>
            Error
          </Button>
        </div>
      );
    },
    code: () =>
      [
        "const toast = useTxToast();",
        "",
        "toast.pending();                  // waiting for signature",
        "toast.success('Token minted');    // replaces the pending toast",
        "toast.error(error.message);",
      ].join("\n"),
  },

  {
    id: "network-switcher",
    group: "Network",
    name: "NetworkSwitcher",
    description: "Switches the live API connection between mainnet, testnet, a local node or a custom RPC.",
    note: "Switching here re-points the whole playground preview at the chosen node.",
    controls: [{ type: "boolean", id: "allowCustom", label: "Allow custom RPC", defaultValue: true }],
    Demo: ({ props }) => <NetworkSwitcher allowCustom={bool(props, "allowCustom")} />,
    code: (props) =>
      jsx(
        "NetworkSwitcher",
        { allowCustom: bool(props, "allowCustom") },
        { defaults: { allowCustom: true } },
      ),
  },
  {
    id: "node-status",
    group: "Network",
    name: "NodeStatus",
    description: "Live connection indicator for the node the provider is talking to.",
    controls: [
      { type: "boolean", id: "showChainName", label: "Show chain name", defaultValue: true },
    ],
    Demo: ({ props }) => <NodeStatus showChainName={bool(props, "showChainName")} />,
    code: (props) =>
      jsx(
        "NodeStatus",
        { showChainName: bool(props, "showChainName") },
        { defaults: { showChainName: true } },
      ),
  },

  {
    id: "button",
    group: "Primitives",
    name: "Button",
    description: "Five variants, three sizes, loading state.",
    controls: [
      { type: "text", id: "label", label: "Label", defaultValue: "Send transaction" },
      {
        type: "select",
        id: "variant",
        label: "Variant",
        options: ["primary", "secondary", "outline", "ghost", "danger"],
        defaultValue: "primary",
      },
      {
        type: "select",
        id: "size",
        label: "Size",
        options: ["sm", "md", "lg"],
        defaultValue: "md",
      },
      { type: "boolean", id: "isLoading", label: "Loading", defaultValue: false },
      { type: "boolean", id: "disabled", label: "Disabled", defaultValue: false },
      { type: "boolean", id: "block", label: "Full width", defaultValue: false },
    ],
    Demo: ({ props }) => (
      <Button
        variant={str(props, "variant", "primary") as "primary"}
        size={str(props, "size", "md") as "md"}
        isLoading={bool(props, "isLoading")}
        disabled={bool(props, "disabled")}
        block={bool(props, "block")}
      >
        {str(props, "label", "Send transaction")}
      </Button>
    ),
    code: (props) =>
      jsx(
        "Button",
        {
          variant: str(props, "variant"),
          size: str(props, "size"),
          isLoading: bool(props, "isLoading"),
          disabled: bool(props, "disabled"),
          block: bool(props, "block"),
        },
        {
          children: str(props, "label", "Send transaction"),
          defaults: {
            variant: "primary",
            size: "md",
            isLoading: false,
            disabled: false,
            block: false,
          },
        },
      ),
  },
  {
    id: "input",
    group: "Primitives",
    name: "Input",
    description: "Labelled text field with hint and error states.",
    controls: [
      { type: "text", id: "label", label: "Label", defaultValue: "Recipient" },
      { type: "text", id: "placeholder", label: "Placeholder", defaultValue: "kGkLEU3e…" },
      { type: "text", id: "hint", label: "Hint", defaultValue: "Vara SS58 address" },
      { type: "text", id: "error", label: "Error", defaultValue: "" },
      {
        type: "select",
        id: "size",
        label: "Size",
        options: ["sm", "md", "lg"],
        defaultValue: "md",
      },
    ],
    Demo: ({ props }) => (
      <div style={{ width: 280 }}>
        <Input
          label={str(props, "label")}
          placeholder={str(props, "placeholder")}
          hint={str(props, "hint")}
          error={str(props, "error") || undefined}
          size={str(props, "size", "md") as "md"}
        />
      </div>
    ),
    code: (props) =>
      jsx(
        "Input",
        {
          label: str(props, "label"),
          placeholder: str(props, "placeholder"),
          hint: str(props, "hint"),
          error: str(props, "error"),
          size: str(props, "size"),
        },
        { defaults: { size: "md" } },
      ),
  },
  {
    id: "select",
    group: "Primitives",
    name: "Select",
    description: "Labelled select built on the native control.",
    controls: [
      { type: "text", id: "label", label: "Label", defaultValue: "Network" },
      {
        type: "select",
        id: "size",
        label: "Size",
        options: ["sm", "md", "lg"],
        defaultValue: "md",
      },
    ],
    Demo: ({ props }) => (
      <div style={{ width: 240 }}>
        <Select
          label={str(props, "label")}
          size={str(props, "size", "md") as "md"}
          options={[
            { value: "mainnet", label: "Vara Mainnet" },
            { value: "testnet", label: "Vara Testnet" },
            { value: "local", label: "Local node" },
          ]}
        />
      </div>
    ),
    code: (props) =>
      jsx(
        "Select",
        { label: str(props, "label"), size: str(props, "size"), options: "{options}" },
        { defaults: { size: "md" } },
      ).replace('options="{options}"', "options={options}"),
  },
  {
    id: "card",
    group: "Primitives",
    name: "Card",
    description: "Surface for grouped content, in three elevations.",
    controls: [
      { type: "text", id: "title", label: "Title", defaultValue: "Your VFT balance" },
      {
        type: "text",
        id: "description",
        label: "Description",
        defaultValue: "Updated every block",
      },
      {
        type: "select",
        id: "variant",
        label: "Variant",
        options: ["default", "flat", "elevated"],
        defaultValue: "default",
      },
    ],
    Demo: ({ props }) => (
      <Card
        title={str(props, "title")}
        description={str(props, "description")}
        variant={str(props, "variant", "default") as "default"}
        style={{ width: 280 }}
      >
        <Balance address={DEMO_ADDRESS} />
      </Card>
    ),
    code: (props) =>
      jsx(
        "Card",
        {
          title: str(props, "title"),
          description: str(props, "description"),
          variant: str(props, "variant"),
        },
        { children: "\n  <Balance />\n", defaults: { variant: "default" } },
      ),
  },
  {
    id: "modal",
    group: "Primitives",
    name: "Modal",
    description: "Themed dialog, portalled inside the theme scope so tokens still apply.",
    controls: [
      { type: "text", id: "title", label: "Title", defaultValue: "Send VARA" },
      { type: "boolean", id: "hideCloseButton", label: "Hide close button", defaultValue: false },
    ],
    Demo: ({ props }) => {
      const [isOpen, setIsOpen] = useState(false);

      return (
        <>
          <Button onClick={() => setIsOpen(true)}>Open modal</Button>

          <Modal
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            title={str(props, "title", "Send VARA")}
            description="Modals inherit every theme token."
            hideCloseButton={bool(props, "hideCloseButton")}
            footer={
              <>
                <Button variant="ghost" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setIsOpen(false)}>Send</Button>
              </>
            }
          >
            <Input label="Amount" placeholder="0.0" />
          </Modal>
        </>
      );
    },
    code: (props) =>
      jsx(
        "Modal",
        {
          isOpen: "{isOpen}",
          title: str(props, "title"),
          hideCloseButton: bool(props, "hideCloseButton"),
        },
        { children: "\n  <Input label=\"Amount\" />\n", defaults: { hideCloseButton: false } },
      ).replace('isOpen="{isOpen}"', "isOpen={isOpen} onClose={close}"),
  },
  {
    id: "badge",
    group: "Primitives",
    name: "Badge",
    description: "Status pill in six tones.",
    controls: [
      { type: "text", id: "label", label: "Label", defaultValue: "Finalized" },
      {
        type: "select",
        id: "tone",
        label: "Tone",
        options: ["neutral", "primary", "success", "warning", "danger", "outline"],
        defaultValue: "success",
      },
    ],
    Demo: ({ props }) => (
      <Badge tone={str(props, "tone", "success") as "success"}>
        {str(props, "label", "Finalized")}
      </Badge>
    ),
    code: (props) =>
      jsx(
        "Badge",
        { tone: str(props, "tone") },
        { children: str(props, "label", "Finalized"), defaults: { tone: "neutral" } },
      ),
  },
  {
    id: "spinner",
    group: "Primitives",
    name: "Spinner",
    description: "Inherits currentColor, so it reads on every surface.",
    controls: [
      {
        type: "select",
        id: "size",
        label: "Size",
        options: ["sm", "md", "lg"],
        defaultValue: "md",
      },
    ],
    Demo: ({ props }) => <Spinner size={str(props, "size", "md") as "md"} />,
    code: (props) => jsx("Spinner", { size: str(props, "size") }, { defaults: { size: "md" } }),
  },
  {
    id: "skeleton",
    group: "Primitives",
    name: "Skeleton",
    description: "Loading placeholder that pulses on the muted token.",
    controls: [],
    Demo: () => (
      <div style={{ display: "flex", flexDirection: "column", gap: 8, width: 240 }}>
        <Skeleton width={180} height={18} />
        <Skeleton width={240} height={12} />
        <Skeleton width={120} height={12} />
      </div>
    ),
    code: () => '<Skeleton width={180} height={18} />',
  },
];

export const groups = ["Wallet", "Transactions", "Network", "Primitives"] as const;
