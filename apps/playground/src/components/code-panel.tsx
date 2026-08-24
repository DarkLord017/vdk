import { useEffect, useState } from "react";

import { highlight } from "../lib/highlight.js";

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

  const lineCount = active.code.split("\n").length;

  return (
    <section className="pg-code">
      <header className="pg-code-head">
        <div className="pg-tabs" role="tablist">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={tab.id === active.id}
              className={tab.id === active.id ? "is-active" : undefined}
              onClick={() => setActiveId(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="pg-code-meta">
          <span className="pg-lang">{active.language}</span>

          <button type="button" className="pg-copy" onClick={() => void onCopy()}>
            {copied ? (
              <>
                <CheckIcon /> Copied
              </>
            ) : (
              <>
                <CopyIcon /> Copy
              </>
            )}
          </button>
        </div>
      </header>

      <div className="pg-code-body">
        {/* Gutter is aria-hidden: line numbers are decoration, and must not be selectable
            alongside the code when the reader drags to copy by hand. */}
        <div className="pg-gutter" aria-hidden="true">
          {Array.from({ length: lineCount }, (_, index) => (
            <span key={index}>{index + 1}</span>
          ))}
        </div>

        <pre>
          <code>{highlight(active.code)}</code>
        </pre>
      </div>
    </section>
  );
}

function CopyIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="5.5" y="5.5" width="8" height="8" rx="1.8" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M10.5 3.5v-.2A1.3 1.3 0 0 0 9.2 2H3.3A1.3 1.3 0 0 0 2 3.3v5.9a1.3 1.3 0 0 0 1.3 1.3h.2"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M3 8.5l3.2 3.2L13 5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
