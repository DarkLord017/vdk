import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { VdkThemeProvider } from "../provider/theme-context.js";
import { ProgramQuery, formatValue } from "./program-query.js";

const { useProgramQueryMock } = vi.hoisted(() => ({ useProgramQueryMock: vi.fn() }));

vi.mock("@gear-js/react-hooks", () => ({ useProgramQuery: useProgramQueryMock }));

const program = { programId: "0xabc" as const, Vft: { BalanceOf: vi.fn() } };

function renderQuery(ui: React.ReactNode) {
  return render(<VdkThemeProvider>{ui}</VdkThemeProvider>);
}

describe("ProgramQuery", () => {
  it("says so when no program is loaded, without querying", () => {
    useProgramQueryMock.mockReturnValue({
      data: undefined,
      error: null,
      isFetching: false,
      refetch: vi.fn(),
    });

    renderQuery(<ProgramQuery program={undefined} serviceName="Vft" functionName="BalanceOf" />);

    expect(screen.getByText("No program loaded")).toBeInTheDocument();
    expect(useProgramQueryMock.mock.calls.at(-1)?.[0].query.enabled).toBe(false);
  });

  it("labels itself Service.function by default", () => {
    useProgramQueryMock.mockReturnValue({
      data: 42n,
      error: null,
      isFetching: false,
      refetch: vi.fn(),
    });

    renderQuery(<ProgramQuery program={program} serviceName="Vft" functionName="BalanceOf" />);

    expect(screen.getByText("Vft.BalanceOf")).toBeInTheDocument();
    expect(screen.getByText("42")).toBeInTheDocument();
  });

  it("swaps the refresh control for a live indicator when watching", () => {
    useProgramQueryMock.mockReturnValue({
      data: "ok",
      error: null,
      isFetching: false,
      refetch: vi.fn(),
    });

    const { rerender } = renderQuery(
      <ProgramQuery program={program} serviceName="Vft" functionName="BalanceOf" />,
    );
    expect(screen.getByRole("button", { name: "Refresh" })).toBeInTheDocument();

    rerender(
      <VdkThemeProvider>
        <ProgramQuery program={program} serviceName="Vft" functionName="BalanceOf" watch />
      </VdkThemeProvider>,
    );

    expect(screen.queryByRole("button", { name: "Refresh" })).toBeNull();
    expect(screen.getByText("live")).toBeInTheDocument();
  });

  it("shows the query error instead of a stale value", () => {
    useProgramQueryMock.mockReturnValue({
      data: undefined,
      error: new Error("Program not found"),
      isFetching: false,
      refetch: vi.fn(),
    });

    renderQuery(<ProgramQuery program={program} serviceName="Vft" functionName="BalanceOf" />);

    expect(screen.getByText("Program not found")).toBeInTheDocument();
  });

  it("honours a custom formatter", () => {
    useProgramQueryMock.mockReturnValue({
      data: 1_500_000_000_000n,
      error: null,
      isFetching: false,
      refetch: vi.fn(),
    });

    renderQuery(
      <ProgramQuery
        program={program}
        serviceName="Vft"
        functionName="BalanceOf"
        label="Balance"
        format={(value) => `${Number(value as bigint) / 1e12} VARA`}
      />,
    );

    expect(screen.getByText("1.5 VARA")).toBeInTheDocument();
  });
});

describe("formatValue", () => {
  it("renders bigints, including nested ones JSON.stringify would throw on", () => {
    expect(formatValue(42n)).toBe("42");
    expect(formatValue({ balance: 42n, owner: "0x01" })).toContain('"balance": "42"');
  });

  it("passes strings through unquoted", () => {
    expect(formatValue("0xabc")).toBe("0xabc");
  });
});
