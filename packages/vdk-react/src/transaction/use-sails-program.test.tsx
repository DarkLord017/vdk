import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useSailsProgram } from "./use-sails-program.js";

const mintFn = Object.assign(vi.fn(), {
  args: [
    { name: "to", type: class ActorId {} },
    { name: "value", type: class U256 {} },
  ],
  docs: "Mint tokens to an account",
});

const balanceQuery = Object.assign(vi.fn(), {
  args: [{ name: "account", type: class ActorId {} }],
});

const fakeSails = {
  services: {
    Vft: { functions: { Mint: mintFn }, queries: { BalanceOf: balanceQuery }, events: {} },
  },
};

const { useSailsMock } = vi.hoisted(() => ({ useSailsMock: vi.fn() }));

vi.mock("@gear-js/react-hooks", () => ({ useSails: useSailsMock }));

describe("useSailsProgram", () => {
  it("stays idle until both a program id and an IDL are supplied", () => {
    useSailsMock.mockReturnValue({ data: undefined, isLoading: true, error: null });

    const { result } = renderHook(() => useSailsProgram({ programId: "0x01" }));

    expect(result.current.program).toBeUndefined();
    expect(result.current.services).toEqual([]);
    // An enabled:false query reports isLoading, but nothing is actually in flight.
    expect(result.current.isLoading).toBe(false);
  });

  it("exposes services in the shape the transaction hooks call", () => {
    useSailsMock.mockReturnValue({ data: fakeSails, isLoading: false, error: null });

    const { result } = renderHook(() =>
      useSailsProgram({ programId: "0xabc", idl: "service Vft {}" }),
    );

    const program = result.current.program as Record<string, Record<string, unknown>>;

    // This is exactly what usePrepareProgramTransaction does internally.
    expect(typeof program.Vft!.Mint).toBe("function");
    expect(program.programId).toBe("0xabc");
  });

  it("describes functions and their arguments for the UI", () => {
    useSailsMock.mockReturnValue({ data: fakeSails, isLoading: false, error: null });

    const { result } = renderHook(() =>
      useSailsProgram({ programId: "0xabc", idl: "service Vft {}" }),
    );

    expect(result.current.services).toEqual([
      {
        name: "Vft",
        functions: [
          {
            name: "Mint",
            docs: "Mint tokens to an account",
            args: [
              { name: "to", type: "ActorId" },
              { name: "value", type: "U256" },
            ],
          },
        ],
        queries: [{ name: "BalanceOf", docs: undefined, args: [{ name: "account", type: "ActorId" }] }],
      },
    ]);
  });

  it("surfaces a parse failure instead of retrying it", () => {
    const error = new Error("Failed to parse IDL");
    useSailsMock.mockReturnValue({ data: undefined, isLoading: false, error });

    const { result } = renderHook(() => useSailsProgram({ programId: "0xabc", idl: "nonsense" }));

    expect(result.current.error).toBe(error);
    expect(result.current.program).toBeUndefined();
  });
});
