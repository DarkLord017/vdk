import { Badge, Button, TransactionButton, useSailsProgram } from "@vara-dk/react";
import { useEffect, useState } from "react";

import {
  parseArg,
  setProgramConfig,
  useProgramConfig,
  type ProgramConfig,
} from "../state/program-store.js";

type Props = {
  label: string;
  variant: "primary" | "secondary" | "outline" | "ghost" | "danger";
  confirm: boolean;
};

/**
 * The transaction demo, wired to whatever program the visitor pastes in.
 *
 * Sails needs the IDL as well as the address: the program's services, functions and argument
 * types are not recoverable from an on-chain address alone.
 */
export function ProgramDemo({ label, variant, confirm }: Props) {
  const config = useProgramConfig();
  const [draftId, setDraftId] = useState(config.programId);
  const [draftIdl, setDraftIdl] = useState(config.idl);
  const [lastResult, setLastResult] = useState<string>();

  const { program, services, isLoading, error } = useSailsProgram({
    programId: config.programId || undefined,
    idl: config.idl || undefined,
  });

  const service = services.find((item) => item.name === config.serviceName) ?? services[0];
  const fn = service?.functions.find((item) => item.name === config.functionName) ?? service?.functions[0];

  // Once an IDL parses, land on a valid service/function instead of leaving the selects empty.
  useEffect(() => {
    if (!service || !fn) return;
    if (config.serviceName === service.name && config.functionName === fn.name) return;

    setProgramConfig({ serviceName: service.name, functionName: fn.name, args: {} });
  }, [service, fn, config.serviceName, config.functionName]);

  const isLoaded = Boolean(program && service && fn);

  return (
    <div className="pg-program">
      <div className="pg-program-form">
        <label className="pg-field">
          <span>Program ID</span>
          <input
            type="text"
            spellCheck={false}
            placeholder="0x…"
            value={draftId}
            onChange={(event) => setDraftId(event.target.value)}
          />
        </label>

        <label className="pg-field pg-field-grow">
          <span>IDL</span>
          <textarea
            spellCheck={false}
            rows={4}
            placeholder={'service Vft {\n  Mint : (to: actor_id, value: u256) -> bool;\n}'}
            value={draftIdl}
            onChange={(event) => setDraftIdl(event.target.value)}
          />
        </label>

        <div className="pg-program-actions">
          <Button
            size="sm"
            onClick={() =>
              setProgramConfig({
                programId: draftId.trim(),
                idl: draftIdl.trim(),
                serviceName: "",
                functionName: "",
                args: {},
              })
            }
            disabled={!draftId.trim() || !draftIdl.trim()}
          >
            Load program
          </Button>

          {(config.programId || config.idl) && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setDraftId("");
                setDraftIdl("");
                setProgramConfig({ programId: "", idl: "", serviceName: "", functionName: "", args: {} });
              }}
            >
              Clear
            </Button>
          )}

          {isLoading && <Badge tone="warning">Parsing…</Badge>}
          {error && <Badge tone="danger">{error.message}</Badge>}
          {isLoaded && <Badge tone="success">{services.length} service(s) loaded</Badge>}
        </div>
      </div>

      {isLoaded && service && fn ? (
        <div className="pg-program-call">
          <div className="pg-program-selects">
            <label className="pg-field">
              <span>Service</span>
              <select
                value={service.name}
                onChange={(event) =>
                  setProgramConfig({ serviceName: event.target.value, functionName: "", args: {} })
                }
              >
                {services.map((item) => (
                  <option key={item.name} value={item.name}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="pg-field">
              <span>Function</span>
              <select
                value={fn.name}
                onChange={(event) => setProgramConfig({ functionName: event.target.value, args: {} })}
              >
                {service.functions.map((item) => (
                  <option key={item.name} value={item.name}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {fn.args.length > 0 && (
            <div className="pg-program-args">
              {fn.args.map((arg) => (
                <label className="pg-field" key={arg.name}>
                  <span>
                    {arg.name} <em>{arg.type}</em>
                  </span>
                  <input
                    type="text"
                    spellCheck={false}
                    value={config.args[arg.name] ?? ""}
                    onChange={(event) =>
                      setProgramConfig({ args: { ...config.args, [arg.name]: event.target.value } })
                    }
                  />
                </label>
              ))}
            </div>
          )}

          <TransactionButton
            program={program}
            serviceName={service.name}
            functionName={fn.name}
            args={fn.args.map((arg) => parseArg(config.args[arg.name] ?? ""))}
            confirm={confirm}
            variant={variant}
            onSuccess={() => setLastResult("Transaction finalized")}
            onError={(cause) => setLastResult(cause.message)}
          >
            {label}
          </TransactionButton>

          {lastResult && <p className="pg-program-result">{lastResult}</p>}
        </div>
      ) : (
        <Button variant={variant} disabled>
          {label}
        </Button>
      )}
    </div>
  );
}

/** The snippet shown in the Usage tab, matching whatever is loaded. */
export function programUsageCode(config: ProgramConfig, props: Props): string {
  const service = config.serviceName || "Vft";
  const fn = config.functionName || "Mint";
  const args = Object.values(config.args).filter(Boolean);

  const argsLine = args.length > 0 ? `\n  args={[${args.map(literal).join(", ")}]}` : "";
  const confirmLine = props.confirm ? "\n  confirm" : "";
  const variantLine = props.variant === "primary" ? "" : `\n  variant="${props.variant}"`;

  return [
    'const { program } = useSailsProgram({',
    `  programId: "${config.programId || "0x…"}",`,
    "  idl: IDL,",
    "});",
    "",
    "<TransactionButton",
    "  program={program}",
    `  serviceName="${service}"`,
    `  functionName="${fn}"${argsLine}${confirmLine}${variantLine}`,
    ">",
    `  ${props.label}`,
    "</TransactionButton>",
  ].join("\n");
}

function literal(value: string): string {
  const parsed = parseArg(value);
  return typeof parsed === "string" ? `"${parsed}"` : String(parsed);
}
