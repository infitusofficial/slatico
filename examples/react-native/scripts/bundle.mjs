import { execFile } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");

async function runBundle() {
  const platform = process.argv[2] ?? "android";
  if (platform !== "android" && platform !== "ios") {
    throw new Error(`Unsupported platform "${platform}". Expected "android" or "ios".`);
  }

  const outDir = path.join(projectRoot, "dist", platform);
  const assetsDir = path.join(outDir, "assets");
  const bundleOut = path.join(outDir, `index.${platform}.bundle`);

  await fs.rm(outDir, { recursive: true, force: true });
  await fs.mkdir(assetsDir, { recursive: true });

  const cliEntry = path.resolve(
    projectRoot,
    "node_modules",
    "@react-native-community",
    "cli",
    "build",
    "bin.js"
  );

  const { stdout, stderr } = await execFileAsync(
    process.execPath,
    [
      cliEntry,
      "bundle",
      "--platform",
      platform,
      "--dev",
      "false",
      "--reset-cache",
      "--config",
      path.join(projectRoot, "metro.config.cjs"),
      "--entry-file",
      path.join(projectRoot, "index.js"),
      "--bundle-output",
      bundleOut,
      "--assets-dest",
      assetsDir
    ],
    {
      cwd: projectRoot,
      env: {
        ...process.env,
        NODE_ENV: "production"
      }
    }
  );

  if (stdout) {
    process.stdout.write(stdout);
  }
  if (stderr) {
    process.stderr.write(stderr);
  }

  const stat = await fs.stat(bundleOut);
  if (stat.size <= 0) {
    throw new Error(`Metro bundle "${bundleOut}" is empty.`);
  }
  console.log(
    `[Slatico RN Metro] Bundled ${platform} (${(stat.size / 1024).toFixed(1)} KB) -> ${bundleOut}`
  );
}

runBundle().catch((err) => {
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
});
