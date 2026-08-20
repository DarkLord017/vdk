import { VdkProvider } from "@vara-dk/react";
import { serializeTheme } from "@vara-dk/theme";
import "@vara-dk/react/styles.css";
import { useMemo, useState } from "react";

import { CodePanel } from "./components/code-panel.js";
import { PreviewCanvas } from "./components/preview-canvas.js";
import { ThemeEditor } from "./components/theme-editor.js";
import { groups, showcases } from "./showcase/registry.js";
import { defaultProps, type ShowcaseProps } from "./showcase/types.js";
import { useProgramConfig } from "./state/program-store.js";
import { useThemeState } from "./state/theme-state.js";

export function App() {
  const {
    state,
    theme,
    presetTheme,
    setPreset,
    setScheme,
    setToken,
    reset,
    shareUrl,
  } = useThemeState();

  const [activeId, setActiveId] = useState(showcases[0]!.id);
  const [propsById, setPropsById] = useState<Record<string, ShowcaseProps>>({});
  const [shared, setShared] = useState(false);

  const showcase = showcases.find((item) => item.id === activeId) ?? showcases[0]!;
  const props = propsById[showcase.id] ?? defaultProps(showcase);

  const onProp = (id: string, value: string | boolean) => {
    setPropsById((current) => ({
      ...current,
      [showcase.id]: { ...props, [id]: value },
    }));
  };

  // The transaction snippet depends on the loaded program too, not just the controls.
  const programConfig = useProgramConfig();

  const usageCode = useMemo(() => {
    const snippet = showcase.code(props);
    return `import { ${importsFor(snippet)} } from "@vara-dk/react";\n\n${snippet}`;
  }, [showcase, props, programConfig]);

  // Serialized against the preset, so the snippet is only what the user actually changed.
  const themeCode = useMemo(
    () =>
      serializeTheme(theme, {
        base: presetTheme,
        baseName: state.presetId === "vara" ? undefined : `presetTheme /* ${state.presetId} */`,
      }),
    [theme, presetTheme, state.presetId],
  );

  const setupCode = useMemo(
    () =>
      [
        'import { VdkProvider } from "@vara-dk/react";',
        'import "@vara-dk/react/styles.css";',
        'import { theme } from "./theme";',
        "",
        "export function App() {",
        "  return (",
        "    <VdkProvider",
        '      appName="My Vara dApp"',
        '      network="mainnet"',
        "      theme={theme}",
        `      colorScheme="${state.scheme}"`,
        "    >",
        "      <Routes />",
        "    </VdkProvider>",
        "  );",
        "}",
      ].join("\n"),
    [state.scheme],
  );

  const onShare = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl());
      setShared(true);
      setTimeout(() => setShared(false), 1600);
    } catch {
      setShared(false);
    }
  };

  return (
    <div className="pg-root" data-scheme={state.scheme}>
      <header className="pg-header">
        <div className="pg-brand">
          <span className="pg-logo" aria-hidden="true" />
          <div>
            <strong>VDK</strong>
            <span>Vara Development Kit</span>
          </div>
        </div>

        <div className="pg-header-actions">
          <button type="button" className="pg-ghost" onClick={() => void onShare()}>
            {shared ? "Link copied ✓" : "Share theme"}
          </button>
          <a
            className="pg-ghost"
            href="https://wiki.vara.network/docs/vara-network/api"
            target="_blank"
            rel="noreferrer"
          >
            Vara docs ↗
          </a>
        </div>
      </header>

      <div className="pg-body">
        <nav className="pg-nav">
          {groups.map((group) => (
            <section key={group}>
              <h3>{group}</h3>

              <ul>
                {showcases
                  .filter((item) => item.group === group)
                  .map((item) => (
                    <li key={item.id}>
                      <button
                        type="button"
                        className={item.id === showcase.id ? "is-active" : undefined}
                        onClick={() => setActiveId(item.id)}
                      >
                        {item.name}
                      </button>
                    </li>
                  ))}
              </ul>
            </section>
          ))}
        </nav>

        <main className="pg-main">
          {/*
            The provider is remounted only when the network changes; theme edits flow through
            as props, so the live preview re-skins without losing wallet or API state.
          */}
          <VdkProvider
            appName="VDK Playground"
            network="testnet"
            theme={theme}
            colorScheme={state.scheme}
            className="pg-provider"
          >
            <PreviewCanvas showcase={showcase} props={props} onProp={onProp} />
          </VdkProvider>

          <CodePanel
            tabs={[
              { id: "usage", label: "Usage", code: usageCode, language: "tsx" },
              { id: "theme", label: "Theme", code: themeCode, language: "ts" },
              { id: "setup", label: "Setup", code: setupCode, language: "tsx" },
            ]}
          />
        </main>

        <ThemeEditor
          theme={theme}
          presetId={state.presetId}
          scheme={state.scheme}
          onPreset={(id) => setPreset(id as never)}
          onScheme={setScheme}
          onToken={setToken}
          onReset={reset}
        />
      </div>
    </div>
  );
}

/** Names referenced by a generated snippet, so the import line matches the code below it. */
function importsFor(snippet: string): string {
  const names = new Set<string>();

  for (const match of snippet.matchAll(/<([A-Z][A-Za-z]*)/g)) names.add(match[1]!);
  for (const match of snippet.matchAll(/\b(use[A-Z][A-Za-z]*)\(/g)) names.add(match[1]!);

  return [...names].sort().join(", ");
}
