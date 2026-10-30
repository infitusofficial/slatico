export const PUA_RANGE_START = 0xe001;
export const PUA_RANGE_END = 0xf8ff;

export interface SlaticoCodepointManifest {
  readonly schemaVersion: 1;
  readonly puaRangeStart: string;
  readonly puaRangeEnd: string;
  readonly nextCodepoint: string;
  readonly retiredCodepoints: readonly string[];
  readonly codepoints: Readonly<Record<string, string>>;
}

export function formatCodepointHex(codepoint: number): string {
  return `0x${codepoint.toString(16).toUpperCase().padStart(4, "0")}`;
}

export function formatCssCodepointEscape(codepoint: number): string {
  return `\\${codepoint.toString(16).toLowerCase().padStart(4, "0")}`;
}

export function parseCodepointHex(hexStr: string): number {
  const normalized = hexStr.trim();
  if (!/^0x[0-9A-Fa-f]{4}$/.test(normalized)) {
    throw new Error(`Invalid Unicode PUA codepoint format "${hexStr}". Expected "0xE001" format.`);
  }
  const value = Number.parseInt(normalized.slice(2), 16);
  if (value < PUA_RANGE_START || value > PUA_RANGE_END) {
    throw new Error(
      `Codepoint "${hexStr}" is outside the Unicode Private Use Area (${formatCodepointHex(
        PUA_RANGE_START
      )}–${formatCodepointHex(PUA_RANGE_END)}).`
    );
  }
  return value;
}

/**
 * Deterministically resolves the Unicode Private Use Area codepoint manifest:
 * - Preserves all existing icon codepoints unchanged (even when alphabetical order shifts).
 * - Moves removed icons' codepoints into `retiredCodepoints` so they are never reused automatically.
 * - Assigns sequential new codepoints for newly added icons, skipping any active or retired codepoints.
 */
export function resolveStableCodepointManifest(
  currentManifest: SlaticoCodepointManifest,
  productionIconNames: readonly string[]
): SlaticoCodepointManifest {
  const retiredSet = new Set<number>();
  for (const retiredHex of currentManifest.retiredCodepoints) {
    retiredSet.add(parseCodepointHex(retiredHex));
  }

  const activeSet = new Set(productionIconNames);
  const usedCodepoints = new Set<number>();
  const resolvedCodepoints: Record<string, string> = {};
  let highestSeen = PUA_RANGE_START - 1;

  for (const retiredVal of retiredSet) {
    if (retiredVal > highestSeen) {
      highestSeen = retiredVal;
    }
  }

  // 1. Inspect existing mappings: preserve active icons, retire removed icons
  for (const [iconName, hexVal] of Object.entries(currentManifest.codepoints)) {
    const numericVal = parseCodepointHex(hexVal);
    if (numericVal > highestSeen) {
      highestSeen = numericVal;
    }

    if (activeSet.has(iconName)) {
      if (usedCodepoints.has(numericVal) || retiredSet.has(numericVal)) {
        throw new Error(
          `Duplicate or retired Unicode codepoint "${formatCodepointHex(numericVal)}" detected for icon "${iconName}".`
        );
      }
      usedCodepoints.add(numericVal);
      resolvedCodepoints[iconName] = formatCodepointHex(numericVal);
    } else {
      retiredSet.add(numericVal);
    }
  }

  // 2. Determine starting cursor for any new icons
  const declaredNext = currentManifest.nextCodepoint
    ? parseCodepointHex(currentManifest.nextCodepoint)
    : PUA_RANGE_START;
  let nextCandidate = Math.max(declaredNext, highestSeen + 1, PUA_RANGE_START);

  // 3. Assign sequential codepoints to any newly added icons in deterministic order
  for (const iconName of productionIconNames) {
    if (resolvedCodepoints[iconName] !== undefined) {
      continue;
    }

    while (usedCodepoints.has(nextCandidate) || retiredSet.has(nextCandidate)) {
      nextCandidate++;
    }

    if (nextCandidate > PUA_RANGE_END) {
      throw new Error("Exhausted Unicode Private Use Area codepoints (0xE001–0xF8FF).");
    }

    usedCodepoints.add(nextCandidate);
    resolvedCodepoints[iconName] = formatCodepointHex(nextCandidate);
    if (nextCandidate > highestSeen) {
      highestSeen = nextCandidate;
    }
    nextCandidate++;
  }

  while (usedCodepoints.has(nextCandidate) || retiredSet.has(nextCandidate)) {
    nextCandidate++;
  }

  // Sort keys in output for deterministic JSON serialization while keeping assigned values intact
  const sortedCodepoints: Record<string, string> = {};
  for (const key of Object.keys(resolvedCodepoints).sort()) {
    sortedCodepoints[key] = resolvedCodepoints[key]!;
  }

  const sortedRetired = [...retiredSet]
    .sort((a, b) => a - b)
    .map((code) => formatCodepointHex(code));

  return {
    schemaVersion: 1,
    puaRangeStart: formatCodepointHex(PUA_RANGE_START),
    puaRangeEnd: formatCodepointHex(PUA_RANGE_END),
    nextCodepoint: formatCodepointHex(Math.max(nextCandidate, highestSeen + 1)),
    retiredCodepoints: sortedRetired,
    codepoints: sortedCodepoints
  };
}
