import { useEffect, useState } from "react";

type Tab = { id: string; label: string; code: string; language: string };

type Props = {
  tabs: Tab[];
};

export function CodePanel({ tabs }: Props) {
  const [activeId, setActiveId] = useState(tabs[0]?.id ?? "");
  const [copied, setCopied] = useState(false);

  const active = tabs.find((tab) => tab.id === activeId) ?? tabs[0];

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 1600);
    return () => clearTimeout(timer);
  }, [copied]);

  if (!active) return null;

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(active.code);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section className="pg-code">
      <header className="pg-code-head">
        <div className="pg-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={tab.id === active.id ? "is-active" : undefined}
              onClick={() => setActiveId(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <button type="button" className="pg-copy" onClick={() => void onCopy()}>
          {copied ? "Copied ✓" : "Copy"}
        </button>
      </header>

      <pre className="pg-code-body">
        <code>{active.code}</code>
      </pre>
    </section>
  );
}
