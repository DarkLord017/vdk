import {
  Badge,
  Button,
  ProgramQuery,
  TransactionButton,
  useSailsProgram,
  type SailsFunctionInfo,
  type SailsServiceInfo,
} from "@vara-dk/react";
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
 * Loads whatever program the visitor pastes in.
 *
 * Sails needs the IDL as well as the address: a program's services, functions and argument
 * types are not recoverable from an on-chain address alone. Both demos share this through
 * react-query's cache — same program id and IDL, same parsed client.
 */
function useLoadedProgram() {
  const config = useProgramConfig();

  const result = useSailsProgram({
    programId: config.programId || undefined,
    idl: config.idl || undefined,
  });

  return { config, ...result };
}

export function ProgramLoader() {
  const { config, services, isLoading, error } = useLoadedProgram();
  const [draftId, setDraftId] = useState(config.programId);
  const [draftIdl, setDraftIdl] = useState(config.idl);

  return (
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
          placeholder={"service Vft {\n  Mint : (to: actor_id, value: u256) -> bool;\n  query BalanceOf : (account: actor_id) -> u256;\n}"}
          value={draftIdl}
          onChange={(event) => setDraftIdl(event.target.value)}
        />
      </label>

      <div className="pg-program-actions">
        <Button
          size="sm"
          disabled={!draftId.trim() || !draftIdl.trim()}
          onClick={() =>
            setProgramConfig({
              programId: draftId.trim(),
              idl: draftIdl.trim(),
              serviceName: "",
              functionName: "",
              args: {},
              queryServiceName: "",
              queryFunctionName: "",
              queryArgs: {},
            })
          }
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
              setProgramConfig({
                programId: "",
                idl: "",
                serviceName: "",
                functionName: "",
                args: {},
                queryServiceName: "",
                queryFunctionName: "",
                queryArgs: {},
              });
            }}
          >
            Clear
          </Button>
        )}

        {isLoading && <Badge tone="warning">Parsing…</Badge>}
        {error && <Badge tone="danger">{error.message}</Badge>}
        {!isLoading && !error && services.length > 0 && (
          <Badge tone="success">{services.length} service(s) loaded</Badge>
        )}
      </div>
    </div>
  );
}

/** Picks the selected service/function, falling back to the first the IDL offers. */
function resolveSelection(
  services: SailsServiceInfo[],
  serviceName: string,
  functionName: string,
  kind: "functions" | "queries",
): { service?: SailsServiceInfo; fn?: SailsFunctionInfo } {
  const withMembers = services.filter((item) => item[kind].length > 0);
  const service = withMembers.find((item) => item.name === serviceName) ?? withMembers[0];
  const fn = service?.[kind].find((item) => item.name === functionName) ?? service?.[kind][0];

  return { service, fn };
}

function ArgInputs({
  args,
  values,
  onChange,
}: {
  args: SailsFunctionInfo["args"];
  values: Record<string, string>;
  onChange: (next: Record<string, string>) => void;
}) {
  if (args.length === 0) return null;

  return (
    <div className="pg-program-args">
      {args.map((arg) => (
        <label className="pg-field" key={arg.name}>
          <span>
            {arg.name} <em>{arg.type}</em>
          </span>
          <input
            type="text"
            spellCheck={false}
            value={values[arg.name] ?? ""}
            onChange={(event) => onChange({ ...values, [arg.name]: event.target.value })}
          />
        </label>
      ))}
    </div>
  );
}

export function ProgramDemo({ label, variant, confirm }: Props) {
  const { config, program, services } = useLoadedProgram();
  const [lastResult, setLastResult] = useState<string>();

  const { service, fn } = resolveSelection(
    services,
    config.serviceName,
    config.functionName,
    "functions",
  );

  // Once an IDL parses, land on a valid service/function instead of leaving the selects empty.
  useEffect(() => {
    if (!service || !fn) return;
    if (config.serviceName === service.name && config.functionName === fn.name) return;

    setProgramConfig({ serviceName: service.name, functionName: fn.name, args: {} });
  }, [service, fn, config.serviceName, config.functionName]);

  const isLoaded = Boolean(program && service && fn);

  return (
    <div className="pg-program">
      <ProgramLoader />

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
                {services
                  .filter((item) => item.functions.length > 0)
                  .map((item) => (
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

          <ArgInputs
            args={fn.args}
            values={config.args}
            onChange={(args) => setProgramConfig({ args })}
          />

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

export function QueryDemo({ watch }: { watch: boolean }) {
  const { config, program, services } = useLoadedProgram();

  const { service, fn } = resolveSelection(
    services,
    config.queryServiceName,
    config.queryFunctionName,
    "queries",
  );

  useEffect(() => {
    if (!service || !fn) return;
    if (config.queryServiceName === service.name && config.queryFunctionName === fn.name) return;

    setProgramConfig({
      queryServiceName: service.name,
      queryFunctionName: fn.name,
      queryArgs: {},
    });
  }, [service, fn, config.queryServiceName, config.queryFunctionName]);

  return (
    <div className="pg-program">
      <ProgramLoader />

      {program && service && fn ? (
        <div className="pg-program-call">
          <div className="pg-program-selects">
            <label className="pg-field">
              <span>Service</span>
              <select
                value={service.name}
                onChange={(event) =>
                  setProgramConfig({
                    queryServiceName: event.target.value,
                    queryFunctionName: "",
                    queryArgs: {},
                  })
                }
              >
                {services
                  .filter((item) => item.queries.length > 0)
                  .map((item) => (
                    <option key={item.name} value={item.name}>
                      {item.name}
                    </option>
                  ))}
              </select>
            </label>

            <label className="pg-field">
              <span>Query</span>
              <select
                value={fn.name}
                onChange={(event) =>
                  setProgramConfig({ queryFunctionName: event.target.value, queryArgs: {} })
                }
              >
                {service.queries.map((item) => (
                  <option key={item.name} value={item.name}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <ArgInputs
            args={fn.args}
            values={config.queryArgs}
            onChange={(queryArgs) => setProgramConfig({ queryArgs })}
          />

          <ProgramQuery
            program={program}
            serviceName={service.name}
            functionName={fn.name}
            args={fn.args.map((arg) => parseArg(config.queryArgs[arg.name] ?? ""))}
            watch={watch}
          />
        </div>
      ) : (
        <ProgramQuery program={undefined} serviceName="Vft" functionName="BalanceOf" />
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
    ...loaderLines(config),
    "<TransactionButton",
    "  program={program}",
    `  serviceName="${service}"`,
    `  functionName="${fn}"${argsLine}${confirmLine}${variantLine}`,
    ">",
    `  ${props.label}`,
    "</TransactionButton>",
  ].join("\n");
}

export function queryUsageCode(config: ProgramConfig, watch: boolean): string {
  const service = config.queryServiceName || "Vft";
  const fn = config.queryFunctionName || "BalanceOf";
  const args = Object.values(config.queryArgs).filter(Boolean);

  const argsLine = args.length > 0 ? `\n  args={[${args.map(literal).join(", ")}]}` : "";
  const watchLine = watch ? "\n  watch" : "";

  return [
    ...loaderLines(config),
    "<ProgramQuery",
    "  program={program}",
    `  serviceName="${service}"`,
    `  functionName="${fn}"${argsLine}${watchLine}`,
    "/>",
  ].join("\n");
}

function loaderLines(config: ProgramConfig): string[] {
  return [
    "const { program } = useSailsProgram({",
    `  programId: "${config.programId || "0x…"}",`,
    "  idl: IDL,",
    "});",
    "",
  ];
}

function literal(value: string): string {
  const parsed = parseArg(value);
  return typeof parsed === "string" ? `"${parsed}"` : String(parsed);
}
