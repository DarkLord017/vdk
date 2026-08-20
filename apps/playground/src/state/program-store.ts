import { useSyncExternalStore } from "react";

export type ProgramConfig = {
  programId: string;
  idl: string;
  serviceName: string;
  functionName: string;
  /** Raw text per argument, parsed as JSON when it parses. */
  args: Record<string, string>;
};

const STORAGE_KEY = "vdk-playground-program";

const EMPTY: ProgramConfig = {
  programId: "",
  idl: "",
  serviceName: "",
  functionName: "",
  args: {},
};

/**
 * Program config lives outside React so the code panel can render the exact snippet for
 * whatever is loaded in the preview, without threading state through the showcase registry.
 */
let state: ProgramConfig = load();
const listeners = new Set<() => void>();

export function getProgramConfig(): ProgramConfig {
  return state;
}

export function setProgramConfig(patch: Partial<ProgramConfig>): void {
  state = { ...state, ...patch };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Private-mode browsers refuse writes; the session still works, it just won't persist.
  }

  for (const listener of listeners) listener();
}

export function useProgramConfig(): ProgramConfig {
  return useSyncExternalStore(subscribe, getProgramConfig, getProgramConfig);
}

/** Parse an argument value as JSON, falling back to the raw string for plain addresses. */
export function parseArg(value: string): unknown {
  const trimmed = value.trim();
  if (trimmed === "") return "";

  try {
    return JSON.parse(trimmed);
  } catch {
    return trimmed;
  }
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function load(): ProgramConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;

    return { ...EMPTY, ...(JSON.parse(raw) as ProgramConfig) };
  } catch {
    return EMPTY;
  }
}
