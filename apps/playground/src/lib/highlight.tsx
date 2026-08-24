import type { ReactNode } from "react";

/**
 * Token classes, in priority order. The first pattern that matches at a position wins, so
 * comments and strings must precede anything that could match inside them.
 */
const RULES: { type: string; pattern: RegExp }[] = [
  { type: "comment", pattern: /\/\/[^\n]*|\/\*[\s\S]*?\*\// },
  { type: "string", pattern: /"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`/ },
  {
    type: "keyword",
    pattern:
      /\b(?:import|export|from|const|let|var|function|return|await|async|new|if|else|true|false|null|undefined)\b/,
  },
  { type: "tag", pattern: /<\/?[A-Z][\w.]*|<\/?[a-z][\w-]*(?=[\s/>])/ },
  { type: "number", pattern: /\b\d[\d_]*(?:\.\d+)?n?\b/ },
  { type: "attr", pattern: /\b[A-Za-z_$][\w$]*(?=\s*=)/ },
  { type: "fn", pattern: /\b[A-Za-z_$][\w$]*(?=\()/ },
  { type: "punct", pattern: /=>|[{}()[\];,:=<>/]/ },
];

const MASTER = new RegExp(RULES.map((rule) => `(${rule.pattern.source})`).join("|"), "g");

export type Token = { type: string; value: string };

/**
 * Tokenize a TS/TSX snippet for display.
 *
 * Deliberately approximate — it colors code, it does not parse it. The one hard requirement
 * is that concatenating every token reproduces the input exactly, so what the reader sees is
 * always what the copy button copies.
 */
export function tokenize(code: string): Token[] {
  const tokens: Token[] = [];
  let lastIndex = 0;

  for (const match of code.matchAll(MASTER)) {
    const index = match.index ?? 0;

    if (index > lastIndex) tokens.push({ type: "plain", value: code.slice(lastIndex, index) });

    // Group n+1 corresponds to RULES[n]; find which alternative matched.
    const groupIndex = match.slice(1).findIndex((group) => group !== undefined);
    tokens.push({ type: RULES[groupIndex]?.type ?? "plain", value: match[0] });

    lastIndex = index + match[0].length;
  }

  if (lastIndex < code.length) tokens.push({ type: "plain", value: code.slice(lastIndex) });

  return tokens;
}

/** Render tokenized code as spans. Text nodes only — nothing is injected as HTML. */
export function highlight(code: string): ReactNode[] {
  return tokenize(code).map((token, index) =>
    token.type === "plain" ? (
      token.value
    ) : (
      <span key={index} className={`tok-${token.type}`}>
        {token.value}
      </span>
    ),
  );
}
