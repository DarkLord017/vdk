import { describe, expect, it } from "vitest";

import { tokenize } from "./highlight.js";

const join = (code: string) => tokenize(code).map((token) => token.value).join("");

describe("tokenize", () => {
  it("reproduces the input exactly — what is shown is what gets copied", () => {
    const samples = [
      '<Button variant="primary" size="lg">Send</Button>',
      'import { createTheme } from "@vara-dk/theme";\n\nexport const theme = createTheme({\n  colors: { primary: "#ff6b35" },\n});',
      "// a comment with <tags> and \"quotes\"\nconst value = 42n;",
      "",
      "   ",
    ];

    for (const sample of samples) expect(join(sample)).toBe(sample);
  });

  it("classifies the pieces of a JSX snippet", () => {
    const types = Object.fromEntries(
      tokenize('<Badge tone="success">ok</Badge>').map((token) => [token.value.trim(), token.type]),
    );

    expect(types["<Badge"]).toBe("tag");
    expect(types.tone).toBe("attr");
    expect(types['"success"']).toBe("string");
  });

  it("does not tokenize inside strings or comments", () => {
    const tokens = tokenize('const a = "const b = 1"; // const c');

    expect(tokens.filter((token) => token.type === "keyword")).toHaveLength(1);
    expect(tokens.some((token) => token.type === "comment" && token.value === "// const c")).toBe(true);
  });
});
