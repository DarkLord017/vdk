#!/usr/bin/env node
/**
 * Guards the invariant the whole kit rests on: no literal colors inside @vara-dk/react's
 * stylesheets. Every color must come from a `var(--vdk-*)` token, or a theme swap would
 * leave parts of a component stuck on the old palette.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const TARGET = join(ROOT, "packages/vdk-react/src");

// #abc, #aabbcc, rgb(), rgba(), hsl() — anywhere outside a var() fallback.
const LITERAL_COLOR = /#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsla?\(/g;

const failures = [];

for (const file of walk(TARGET)) {
  if (!file.endsWith(".module.css")) continue;

  const contents = readFileSync(file, "utf8");

  contents.split("\n").forEach((line, index) => {
    const matches = line.match(LITERAL_COLOR);
    if (!matches) return;

    failures.push(`${relative(ROOT, file)}:${index + 1}  ${line.trim()}`);
  });
}

if (failures.length > 0) {
  console.error("Literal colors found in @vara-dk/react stylesheets:\n");
  for (const failure of failures) console.error(`  ${failure}`);
  console.error("\nUse a var(--vdk-color-*) token instead.");
  process.exit(1);
}

console.log("✓ no literal colors in @vara-dk/react stylesheets");

function* walk(dir) {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) yield* walk(path);
    else yield path;
  }
}
