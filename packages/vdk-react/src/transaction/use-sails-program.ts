import { useSails } from "@gear-js/react-hooks";
import { useMemo } from "react";

/** One argument of a sails function, as described by the IDL. */
export type SailsArgInfo = {
  name: string;
  /** Human-readable type, e.g. `u256` or `ActorId`. */
  type: string;
};

export type SailsFunctionInfo = {
  name: string;
  args: SailsArgInfo[];
  docs?: string;
};

export type SailsServiceInfo = {
  name: string;
  /** State-changing functions — what `TransactionButton` can send. */
  functions: SailsFunctionInfo[];
  /** Read-only queries. */
  queries: SailsFunctionInfo[];
};

/**
 * A runtime stand-in for a generated sails client.
 *
 * `usePrepareProgramTransaction` only ever does `program[serviceName][functionName](...args)`,
 * so a plain object of the IDL's services satisfies it exactly like a generated class would.
 */
export type SailsProgram = {
  readonly programId?: `0x${string}`;
  readonly [service: string]: unknown;
};

export type UseSailsProgramParameters = {
  /** On-chain address of the program, `0x…`. */
  programId?: string;
  /** The program's IDL source. Sails cannot introspect a program from its address alone. */
  idl?: string;
};

export type UseSailsProgramResult = {
  /** Pass straight to `<TransactionButton program={program} />`. */
  program: SailsProgram | undefined;
  /** Services, functions and argument names parsed out of the IDL. */
  services: SailsServiceInfo[];
  isLoading: boolean;
  /** Set when the IDL failed to parse or the node rejected the program id. */
  error: Error | null;
};

/**
 * Build a usable sails client at runtime from a program id and an IDL string — no codegen
 * step, no generated class checked into the repo.
 *
 * This is what lets a UI accept a contract address from the user and immediately send
 * messages to it.
 */
export function useSailsProgram({
  programId,
  idl,
}: UseSailsProgramParameters): UseSailsProgramResult {
  const isEnabled = Boolean(programId && idl);

  const {
    data: sails,
    isLoading,
    error,
  } = useSails({
    programId: programId as `0x${string}` | undefined,
    idl,
    // A malformed IDL fails the same way every time; retrying just delays the error.
    query: { enabled: isEnabled, retry: false },
  });

  const program = useMemo<SailsProgram | undefined>(() => {
    if (!sails) return undefined;

    const services: Record<string, unknown> = {};
    for (const [name, service] of Object.entries(sails.services)) {
      services[name] = service.functions;
    }

    return { programId: programId as `0x${string}` | undefined, ...services };
  }, [sails, programId]);

  const services = useMemo<SailsServiceInfo[]>(() => {
    if (!sails) return [];

    return Object.entries(sails.services).map(([name, service]) => ({
      name,
      functions: describe(service.functions),
      queries: describe(service.queries),
    }));
  }, [sails]);

  return {
    program,
    services,
    isLoading: isEnabled && isLoading,
    error: error ?? null,
  };
}

type SailsFuncRecord = Record<string, { args: { name: string; type: unknown }[]; docs?: string }>;

function describe(functions: SailsFuncRecord): SailsFunctionInfo[] {
  return Object.entries(functions).map(([name, func]) => ({
    name,
    docs: func.docs,
    args: func.args.map((arg) => ({ name: arg.name, type: typeName(arg.type) })),
  }));
}

/** The IDL's arg types are scale-codec classes; their name is the useful part for a UI. */
function typeName(type: unknown): string {
  if (typeof type === "string") return type;
  if (typeof type === "function") return type.name || "unknown";
  return "unknown";
}
