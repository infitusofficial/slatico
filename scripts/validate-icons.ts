import path from "node:path";
import { SLATICO_STYLES } from "../packages/core/src/types.js";
import { discoverAndValidateIcons } from "./icon-pipeline.js";

async function main(): Promise<void> {
  const repoRoot = process.cwd();
  const iconsDir = path.join(repoRoot, "icons");

  const result = await discoverAndValidateIcons(iconsDir, repoRoot);
  if (!result.valid) {
    console.error(`[Slatico Validate] Failed with ${result.errors.length} error(s):`);
    for (const err of result.errors) {
      console.error(`  - ${err}`);
    }
    process.exit(1);
  }

  console.log(
    `[Slatico Validate] Validated ${result.families.length} production icon families (${
      result.families.length * SLATICO_STYLES.length
    } production SVG variants) across all 7 styles (${result.demoFamilies.length} demo icon families / ${
      result.demoFamilies.length * SLATICO_STYLES.length
    } variants isolated from public exports; ${result.structuralFixes.length} SVG variants normalized in-memory).`
  );
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
});
