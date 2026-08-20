import { render } from "@testing-library/react";
import { VdkThemeProvider } from "@vara-dk/react";
import { describe, expect, it, vi } from "vitest";

import { showcases } from "./registry.js";
import { defaultProps } from "./types.js";

// The registry is the playground's contract with the library: every demo must render and
// every demo must produce a snippet. Chain access is mocked so this stays a fast unit test.
vi.mock("@gear-js/react-hooks", () => ({
  useAccount: () => ({
    account: undefined,
    isAccountReady: true,
    wallets: {},
    login: vi.fn(),
    logout: vi.fn(),
  }),
  useApi: () => ({ api: undefined, isApiReady: false, switchNetwork: vi.fn() }),
  useAlert: () => ({
    info: vi.fn(),
    error: vi.fn(),
    success: vi.fn(),
    loading: vi.fn(),
    remove: vi.fn(),
    update: vi.fn(),
  }),
  useBalance: () => ({ balance: undefined, isBalanceReady: false }),
  useBalanceFormat: () => ({
    getFormattedBalance: () => ({ value: "12.5", unit: "VARA" }),
  }),
  // No program loaded: the transaction demo falls back to its disabled placeholder.
  useSails: () => ({ data: undefined, isLoading: false, error: null }),
  usePrepareProgramTransaction: () => ({ prepareTransactionAsync: vi.fn() }),
  useSendProgramTransaction: () => ({ sendTransactionAsync: vi.fn() }),
  getVaraAddress: (address: string) => address,
}));

describe("showcase registry", () => {
  it("has unique ids", () => {
    const ids = showcases.map((showcase) => showcase.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it.each(showcases.map((showcase) => [showcase.name, showcase] as const))(
    "%s renders and generates code",
    (_name, showcase) => {
      const props = defaultProps(showcase);

      const { container, unmount } = render(
        <VdkThemeProvider>
          <showcase.Demo props={props} />
        </VdkThemeProvider>,
      );

      expect(container.querySelector("[data-vdk-root]")?.childElementCount).toBeGreaterThan(0);

      const code = showcase.code(props);
      expect(code.length).toBeGreaterThan(0);
      // A stray "[object Object]" means a control value leaked into the snippet unformatted.
      expect(code).not.toContain("[object Object]");

      unmount();
    },
  );
});
