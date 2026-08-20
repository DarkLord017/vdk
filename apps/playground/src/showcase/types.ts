import type { ComponentType } from "react";

export type ControlValue = string | boolean;

export type ControlDef =
  | {
      type: "select";
      id: string;
      label: string;
      options: string[];
      defaultValue: string;
    }
  | { type: "boolean"; id: string; label: string; defaultValue: boolean }
  | { type: "text"; id: string; label: string; defaultValue: string };

export type ShowcaseProps = Record<string, ControlValue>;

export type ShowcaseGroup = "Wallet" | "Transactions" | "Network" | "Primitives";

export type Showcase = {
  id: string;
  group: ShowcaseGroup;
  name: string;
  description: string;
  /** Extra note shown under the preview — used to explain what needs a wallet or a program. */
  note?: string;
  controls: ControlDef[];
  /** Rendered as a component so demos can hold their own state (open modals, toasts…). */
  Demo: ComponentType<{ props: ShowcaseProps }>;
  /** The snippet shown in the Usage tab for the current control values. */
  code: (props: ShowcaseProps) => string;
};

export function defaultProps(showcase: Showcase): ShowcaseProps {
  return Object.fromEntries(
    showcase.controls.map((control) => [control.id, control.defaultValue]),
  );
}
