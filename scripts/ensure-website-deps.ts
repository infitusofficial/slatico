import { existsSync } from "node:fs";
import { execSync } from "node:child_process";
import path from "node:path";

const ROOT_DIR = process.cwd();

const REQUIRED_WORKSPACE_ARTIFACTS = [
  "packages/core/dist/index.js",
  "packages/core/dist/index.d.ts",
  "packages/font/dist/slatico.css",
  "packages/font/dist/index.js",
  "packages/svg/dist/index.js",
  "packages/react/dist/index.js",
  "packages/web/dist/index.js"
];

const missing = REQUIRED_WORKSPACE_ARTIFACTS.filter(
  (relPath) => !existsSync(path.join(ROOT_DIR, relPath))
);

if (missing.length > 0) {
  console.log(
    `[Slatico Website Build] Workspace package artifacts missing (${missing.length}); building workspace packages first...`
  );
  execSync("pnpm build:packages", {
    cwd: ROOT_DIR,
    stdio: "inherit"
  });
}
