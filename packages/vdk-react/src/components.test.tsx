import { render, screen } from "@testing-library/react";
import { createTheme } from "@vara-dk/theme";
import { describe, expect, it, vi } from "vitest";

import { Badge } from "./primitives/badge.js";
import { Button } from "./primitives/button.js";
import { Modal } from "./primitives/modal.js";
import { VdkThemeProvider } from "./provider/theme-context.js";
import { ConnectWalletButton } from "./wallet/connect-wallet-button.js";

const { useAccountMock } = vi.hoisted(() => ({ useAccountMock: vi.fn() }));

vi.mock("@gear-js/react-hooks", () => ({
  useAccount: useAccountMock,
  useApi: () => ({ api: undefined, isApiReady: false }),
  useBalance: () => ({ balance: undefined, isBalanceReady: false }),
  useBalanceFormat: () => ({ getFormattedBalance: () => ({ value: "0", unit: "VARA" }) }),
  getVaraAddress: (address: string) => address,
}));

function renderThemed(ui: React.ReactNode, theme?: Parameters<typeof createTheme>[0]) {
  return render(<VdkThemeProvider theme={theme && createTheme(theme)}>{ui}</VdkThemeProvider>);
}

describe("VdkThemeProvider", () => {
  it("applies theme tokens as CSS variables on the root element", () => {
    const { container } = renderThemed(<Button>Go</Button>, { colors: { primary: "#ff00ff" } });
    const root = container.querySelector("[data-vdk-root]") as HTMLElement;

    expect(root.style.getPropertyValue("--vdk-color-primary")).toBe("#ff00ff");
    expect(root.dataset.vdkScheme).toBe("light");
  });

  it("switches base tokens with the color scheme", () => {
    const { container } = render(
      <VdkThemeProvider colorScheme="dark">
        <Button>Go</Button>
      </VdkThemeProvider>,
    );
    const root = container.querySelector("[data-vdk-root]") as HTMLElement;

    expect(root.dataset.vdkScheme).toBe("dark");
    expect(root.style.getPropertyValue("--vdk-color-background")).toBe("#0c1618");
  });
});

describe("Button", () => {
  it("blocks interaction and marks itself busy while loading", () => {
    const onClick = vi.fn();
    renderThemed(
      <Button isLoading onClick={onClick}>
        Send
      </Button>,
    );

    const button = screen.getByRole("button", { name: /send/i });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
  });
});

describe("Modal", () => {
  it("renders inside the themed root so it keeps the CSS variable scope", () => {
    const { container } = renderThemed(
      <Modal isOpen onClose={() => {}} title="Connect">
        <p>Body</p>
      </Modal>,
    );

    const root = container.querySelector("[data-vdk-root]") as HTMLElement;
    expect(root.querySelector('[role="dialog"]')).not.toBeNull();
    expect(screen.getByText("Connect")).toBeInTheDocument();
  });

  it("renders nothing when closed", () => {
    renderThemed(
      <Modal isOpen={false} onClose={() => {}} title="Connect">
        <p>Body</p>
      </Modal>,
    );

    expect(screen.queryByRole("dialog")).toBeNull();
  });
});

describe("Badge", () => {
  it("renders its tone class", () => {
    renderThemed(<Badge tone="success">Detected</Badge>);
    expect(screen.getByText("Detected").className).toMatch(/success/);
  });
});

describe("ConnectWalletButton", () => {
  it("shows the connect label when no account is selected", () => {
    useAccountMock.mockReturnValue({
      account: undefined,
      isAccountReady: true,
      wallets: {},
      login: vi.fn(),
      logout: vi.fn(),
    });

    renderThemed(<ConnectWalletButton />);
    expect(screen.getByRole("button", { name: "Connect wallet" })).toBeInTheDocument();
  });

  it("shows a loading button until accounts are ready", () => {
    useAccountMock.mockReturnValue({
      account: undefined,
      isAccountReady: false,
      wallets: undefined,
      login: vi.fn(),
      logout: vi.fn(),
    });

    renderThemed(<ConnectWalletButton />);
    expect(screen.getByRole("button", { name: /connect wallet/i })).toBeDisabled();
  });

  it("swaps to the account control once an account is connected", () => {
    useAccountMock.mockReturnValue({
      account: {
        address: "kGkLEU3e3XXkJp2WK4eNpVmSab5xUNL9QtmLPh8QfCL2EgotW",
        meta: { name: "Alice", source: "polkadot-js" },
      },
      isAccountReady: true,
      wallets: {},
      login: vi.fn(),
      logout: vi.fn(),
    });

    renderThemed(<ConnectWalletButton />);

    expect(screen.queryByRole("button", { name: "Connect wallet" })).toBeNull();
    expect(screen.getByRole("button", { name: /kGkLE/ })).toBeInTheDocument();
  });
});
