import fs from "fs";
import path from "path";

const ROOT = path.resolve(import.meta.dirname, "..");
const SKIP_DIRS = new Set([
  "node_modules",
  ".next",
  "target",
  "test-results",
  ".git",
  ".kiro",
  "playwright-report",
]);
const EXT = new Set([
  ".ts",
  ".tsx",
  ".json",
  ".md",
  ".mjs",
  ".example",
  ".ts",
]);

function walk(dir, files = []) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      if (!SKIP_DIRS.has(name)) walk(full, files);
    } else if (EXT.has(path.extname(name)) && name !== "pnpm-lock.yaml") {
      files.push(full);
    }
  }
  return files;
}

const replacements = [
  ["@syphus", "@syphus"],
  ["Syphus", "Syphus"],
  ["syphus-rfc-", "syphus-rfc-"],
  ["syphus", "syphus"],
  ["syphus", "syphus"],
];

let changed = 0;
for (const file of walk(ROOT)) {
  let text = fs.readFileSync(file, "utf8");
  let next = text;
  for (const [from, to] of replacements) {
    next = next.split(from).join(to);
  }
  if (next !== text) {
    fs.writeFileSync(file, next, "utf8");
    changed++;
    console.log("updated:", path.relative(ROOT, file));
  }
}
console.log(`Done. ${changed} files updated.`);
