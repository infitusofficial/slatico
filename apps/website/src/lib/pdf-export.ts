import type { IconVariantAsset } from "./icon-asset";
import {
  buildStandaloneSvg,
  getExportFileBaseName,
  triggerBlobDownload,
  type StandaloneSvgOptions
} from "./svg-export";

export interface VectorPdfExportOptions extends StandaloneSvgOptions {
  /**
   * PDF page dimension in points (default 96pt = 4x 24pt master grid).
   * Because all paths are true PDF vector operators, the artwork scales
   * infinitely at any zoom level.
   */
  readonly pageSizePt?: number;
}

interface PdfVectorLayer {
  readonly d: string;
  readonly fillHex: string;
  readonly fillRule: "nonzero" | "evenodd";
  readonly opacity: number;
}

function normalizeColorToHex(raw: string): string {
  const clean = raw.trim().toLowerCase();
  if (clean === "black") return "#000000";
  if (clean === "white") return "#ffffff";
  if (/^#[0-9a-f]{3}$/i.test(clean)) {
    const r = clean[1]!;
    const g = clean[2]!;
    const b = clean[3]!;
    return `#${r}${r}${g}${g}${b}${b}`;
  }
  if (/^#[0-9a-f]{6}$/i.test(clean)) {
    return clean;
  }
  const rgbMatch = clean.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  if (rgbMatch) {
    const r = Math.min(255, Number(rgbMatch[1])).toString(16).padStart(2, "0");
    const g = Math.min(255, Number(rgbMatch[2])).toString(16).padStart(2, "0");
    const b = Math.min(255, Number(rgbMatch[3])).toString(16).padStart(2, "0");
    return `#${r}${g}${b}`;
  }
  return "#1a1931";
}

function hexToPdfRgb(hex: string): [number, number, number] {
  const clean = normalizeColorToHex(hex).slice(1);
  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;
  return [Number(r.toFixed(4)), Number(g.toFixed(4)), Number(b.toFixed(4))];
}

function getAttr(tag: string, attrName: string): string | undefined {
  const regex = new RegExp(`\\b${attrName}="([^"]*)"`, "i");
  const match = tag.match(regex);
  return match?.[1];
}

/**
 * Extract ordered vector layers from a standalone Slatico SVG string,
 * inheriting group-level `fill`, `fill-rule`, and `opacity` attributes.
 */
export function extractSvgVectorLayers(svgMarkup: string): PdfVectorLayer[] {
  const layers: PdfVectorLayer[] = [];
  const innerMatch = svgMarkup.match(/<svg[^>]*>([\s\S]*?)<\/svg>/i);
  const body = innerMatch ? innerMatch[1]! : svgMarkup;

  interface GroupState {
    fill?: string | undefined;
    fillRule?: "nonzero" | "evenodd" | undefined;
    opacity: number;
  }

  const stack: GroupState[] = [{ opacity: 1 }];
  const tagRegex = /<\/?([a-zA-Z0-9]+)\b[^>]*>/g;
  let match: RegExpExecArray | null;

  while ((match = tagRegex.exec(body)) !== null) {
    const fullTag = match[0]!;
    const tagName = match[1]!.toLowerCase();
    const isClosing = fullTag.startsWith("</");
    const isSelfClosing = fullTag.endsWith("/>");

    if (tagName === "g") {
      if (isClosing) {
        if (stack.length > 1) {
          stack.pop();
        }
      } else {
        const parent = stack[stack.length - 1]!;
        const fill = getAttr(fullTag, "fill") ?? parent.fill;
        const rawRule = getAttr(fullTag, "fill-rule") ?? getAttr(fullTag, "clip-rule");
        const fillRule =
          rawRule === "evenodd"
            ? "evenodd"
            : rawRule === "nonzero"
              ? "nonzero"
              : parent.fillRule;
        const opAttr = getAttr(fullTag, "opacity") ?? getAttr(fullTag, "fill-opacity");
        const opacity =
          opAttr !== undefined ? parent.opacity * Number(opAttr) : parent.opacity;
        if (!isSelfClosing) {
          stack.push({ fill, fillRule, opacity });
        }
      }
      continue;
    }

    if (tagName === "rect" && !isClosing) {
      const width = Number(getAttr(fullTag, "width") ?? 0);
      const height = Number(getAttr(fullTag, "height") ?? 0);
      const fill = getAttr(fullTag, "fill");
      if (width > 0 && height > 0 && fill && fill !== "none") {
        layers.push({
          d: `M0 0H${width}V${height}H0Z`,
          fillHex: normalizeColorToHex(fill),
          fillRule: "nonzero",
          opacity: 1
        });
      }
      continue;
    }

    if (tagName === "path" && !isClosing) {
      const d = getAttr(fullTag, "d");
      if (!d) continue;
      const parent = stack[stack.length - 1]!;
      const rawFill = getAttr(fullTag, "fill") ?? parent.fill ?? "#1A1931";
      if (rawFill === "none") continue;
      const rawRule =
        getAttr(fullTag, "fill-rule") ??
        getAttr(fullTag, "clip-rule") ??
        parent.fillRule ??
        "nonzero";
      const opAttr = getAttr(fullTag, "opacity") ?? getAttr(fullTag, "fill-opacity");
      const opacity = Math.max(
        0,
        Math.min(1, opAttr !== undefined ? parent.opacity * Number(opAttr) : parent.opacity)
      );

      layers.push({
        d,
        fillHex: normalizeColorToHex(rawFill),
        fillRule: rawRule === "evenodd" ? "evenodd" : "nonzero",
        opacity: Number(opacity.toFixed(3))
      });
    }
  }

  return layers;
}

/**
 * Convert an SVG elliptical arc segment `(x1, y1) -> (x2, y2)` into one or more
 * cubic Bezier curves `[cp1x, cp1y, cp2x, cp2y, x, y]` in SVG coordinate space.
 */
function arcToCubicBeziers(
  x1: number,
  y1: number,
  rxInput: number,
  ryInput: number,
  xAxisRotationDeg: number,
  largeArcFlag: number,
  sweepFlag: number,
  x2: number,
  y2: number
): Array<[number, number, number, number, number, number]> {
  if (x1 === x2 && y1 === y2) {
    return [];
  }
  let rx = Math.abs(rxInput);
  let ry = Math.abs(ryInput);
  if (rx === 0 || ry === 0) {
    return [[x1, y1, x2, y2, x2, y2]];
  }

  const phi = (xAxisRotationDeg * Math.PI) / 180;
  const cosPhi = Math.cos(phi);
  const sinPhi = Math.sin(phi);

  const dx2 = (x1 - x2) / 2;
  const dy2 = (y1 - y2) / 2;
  const x1p = cosPhi * dx2 + sinPhi * dy2;
  const y1p = -sinPhi * dx2 + cosPhi * dy2;

  let rxSq = rx * rx;
  let rySq = ry * ry;
  const x1pSq = x1p * x1p;
  const y1pSq = y1p * y1p;

  const radiiCheck = x1pSq / rxSq + y1pSq / rySq;
  if (radiiCheck > 1) {
    const scale = Math.sqrt(radiiCheck);
    rx *= scale;
    ry *= scale;
    rxSq = rx * rx;
    rySq = ry * ry;
  }

  const sign = largeArcFlag === sweepFlag ? -1 : 1;
  const sq = Math.max(
    0,
    (rxSq * rySq - rxSq * y1pSq - rySq * x1pSq) / (rxSq * y1pSq + rySq * x1pSq)
  );
  const coef = sign * Math.sqrt(sq);
  const cxp = coef * ((rx * y1p) / ry);
  const cyp = coef * (-(ry * x1p) / rx);

  const cx = cosPhi * cxp - sinPhi * cyp + (x1 + x2) / 2;
  const cy = sinPhi * cxp + cosPhi * cyp + (y1 + y2) / 2;

  function vectorAngle(ux: number, uy: number, vx: number, vy: number): number {
    const dot = ux * vx + uy * vy;
    const len = Math.sqrt(ux * ux + uy * uy) * Math.sqrt(vx * vx + vy * vy);
    const clamped = Math.max(-1, Math.min(1, dot / (len || 1)));
    const angle = Math.acos(clamped);
    return ux * vy - uy * vx < 0 ? -angle : angle;
  }

  const ux = (x1p - cxp) / rx;
  const uy = (y1p - cyp) / ry;
  const vx = (-x1p - cxp) / rx;
  const vy = (-y1p - cyp) / ry;

  const theta1 = vectorAngle(1, 0, ux, uy);
  let deltaTheta = vectorAngle(ux, uy, vx, vy);

  if (!sweepFlag && deltaTheta > 0) {
    deltaTheta -= 2 * Math.PI;
  } else if (sweepFlag && deltaTheta < 0) {
    deltaTheta += 2 * Math.PI;
  }

  const segments = Math.max(1, Math.ceil(Math.abs(deltaTheta) / (Math.PI / 2)));
  const delta = deltaTheta / segments;
  const alpha = (4 / 3) * Math.tan(delta / 4);

  const curves: Array<[number, number, number, number, number, number]> = [];
  let t1 = theta1;

  for (let i = 0; i < segments; i++) {
    const t2 = t1 + delta;
    const cosT1 = Math.cos(t1);
    const sinT1 = Math.sin(t1);
    const cosT2 = Math.cos(t2);
    const sinT2 = Math.sin(t2);

    const e1x = cosT1 - alpha * sinT1;
    const e1y = sinT1 + alpha * cosT1;
    const e2x = cosT2 + alpha * sinT2;
    const e2y = sinT2 - alpha * cosT2;
    const epX = cosT2;
    const epY = sinT2;

    const cp1x = cx + rx * cosPhi * e1x - ry * sinPhi * e1y;
    const cp1y = cy + rx * sinPhi * e1x + ry * cosPhi * e1y;
    const cp2x = cx + rx * cosPhi * e2x - ry * sinPhi * e2y;
    const cp2y = cy + rx * sinPhi * e2x + ry * cosPhi * e2y;
    const endX = cx + rx * cosPhi * epX - ry * sinPhi * epY;
    const endY = cy + rx * sinPhi * epX + ry * cosPhi * epY;

    curves.push([cp1x, cp1y, cp2x, cp2y, endX, endY]);
    t1 = t2;
  }

  return curves;
}

/**
 * Tokenize SVG path `d` attribute into command letters and numeric arguments,
 * properly handling arc flag digits (`0` or `1` without spaces).
 */
function tokenizeSvgPath(d: string): Array<{ cmd: string; args: number[] }> {
  const commandRegex = /([MmLlHhVvCcSsQqTtAaZz])([^MmLlHhVvCcSsQqTtAaZz]*)/g;
  const result: Array<{ cmd: string; args: number[] }> = [];

  let match: RegExpExecArray | null;
  while ((match = commandRegex.exec(d)) !== null) {
    const cmd = match[1]!;
    const rawArgs = match[2] ?? "";

    if (cmd === "A" || cmd === "a") {
      // Arc arguments have pattern: rx ry xAxisRot largeArcFlag(0|1) sweepFlag(0|1) x y
      const arcTokens: number[] = [];
      let idx = 0;
      const readNumber = (): number | null => {
        while (idx < rawArgs.length && /[\s,]/.test(rawArgs[idx]!)) idx++;
        if (idx >= rawArgs.length) return null;
        const sub = rawArgs.slice(idx);
        const m = sub.match(/^[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?/i);
        if (!m) return null;
        idx += m[0]!.length;
        return Number(m[0]!);
      };
      const readFlag = (): number | null => {
        while (idx < rawArgs.length && /[\s,]/.test(rawArgs[idx]!)) idx++;
        if (idx >= rawArgs.length) return null;
        const ch = rawArgs[idx]!;
        if (ch === "0" || ch === "1") {
          idx += 1;
          return Number(ch);
        }
        return readNumber();
      };

      while (idx < rawArgs.length) {
        const rx = readNumber();
        if (rx === null) break;
        const ry = readNumber() ?? 0;
        const rot = readNumber() ?? 0;
        const laf = readFlag() ?? 0;
        const sf = readFlag() ?? 0;
        const x = readNumber() ?? 0;
        const y = readNumber() ?? 0;
        arcTokens.push(rx, ry, rot, laf, sf, x, y);
      }
      result.push({ cmd, args: arcTokens });
    } else {
      const nums = rawArgs.match(/[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?/gi);
      result.push({ cmd, args: nums ? nums.map(Number) : [] });
    }
  }

  return result;
}

/**
 * Convert an SVG path `d` string (in 24x24 viewBox space) into PDF vector path
 * construction operators (`m`, `l`, `c`, `h`) scaled to `pageSizePt` with
 * bottom-left PDF origin (`pdfY = pageSizePt - svgY * scale`).
 */
export function svgPathToPdfOperators(d: string, pageSizePt: number): string {
  const scale = pageSizePt / 24;
  const tx = (x: number): string => (x * scale).toFixed(3);
  const ty = (y: number): string => (pageSizePt - y * scale).toFixed(3);

  const tokens = tokenizeSvgPath(d);
  const ops: string[] = [];

  let curX = 0;
  let curY = 0;
  let subStartX = 0;
  let subStartY = 0;
  let lastCubicCpX = 0;
  let lastCubicCpY = 0;
  let lastQuadCpX = 0;
  let lastQuadCpY = 0;
  let prevCmd = "";

  for (const { cmd, args } of tokens) {
    switch (cmd) {
      case "M": {
        for (let i = 0; i < args.length; i += 2) {
          curX = args[i]!;
          curY = args[i + 1]!;
          if (i === 0) {
            subStartX = curX;
            subStartY = curY;
            ops.push(`${tx(curX)} ${ty(curY)} m`);
          } else {
            ops.push(`${tx(curX)} ${ty(curY)} l`);
          }
        }
        break;
      }
      case "m": {
        for (let i = 0; i < args.length; i += 2) {
          curX += args[i]!;
          curY += args[i + 1]!;
          if (i === 0) {
            subStartX = curX;
            subStartY = curY;
            ops.push(`${tx(curX)} ${ty(curY)} m`);
          } else {
            ops.push(`${tx(curX)} ${ty(curY)} l`);
          }
        }
        break;
      }
      case "L": {
        for (let i = 0; i < args.length; i += 2) {
          curX = args[i]!;
          curY = args[i + 1]!;
          ops.push(`${tx(curX)} ${ty(curY)} l`);
        }
        break;
      }
      case "l": {
        for (let i = 0; i < args.length; i += 2) {
          curX += args[i]!;
          curY += args[i + 1]!;
          ops.push(`${tx(curX)} ${ty(curY)} l`);
        }
        break;
      }
      case "H": {
        for (const x of args) {
          curX = x;
          ops.push(`${tx(curX)} ${ty(curY)} l`);
        }
        break;
      }
      case "h": {
        for (const dx of args) {
          curX += dx;
          ops.push(`${tx(curX)} ${ty(curY)} l`);
        }
        break;
      }
      case "V": {
        for (const y of args) {
          curY = y;
          ops.push(`${tx(curX)} ${ty(curY)} l`);
        }
        break;
      }
      case "v": {
        for (const dy of args) {
          curY += dy;
          ops.push(`${tx(curX)} ${ty(curY)} l`);
        }
        break;
      }
      case "C": {
        for (let i = 0; i < args.length; i += 6) {
          const x1 = args[i]!;
          const y1 = args[i + 1]!;
          const x2 = args[i + 2]!;
          const y2 = args[i + 3]!;
          curX = args[i + 4]!;
          curY = args[i + 5]!;
          lastCubicCpX = x2;
          lastCubicCpY = y2;
          ops.push(`${tx(x1)} ${ty(y1)} ${tx(x2)} ${ty(y2)} ${tx(curX)} ${ty(curY)} c`);
        }
        break;
      }
      case "c": {
        for (let i = 0; i < args.length; i += 6) {
          const x1 = curX + args[i]!;
          const y1 = curY + args[i + 1]!;
          const x2 = curX + args[i + 2]!;
          const y2 = curY + args[i + 3]!;
          curX += args[i + 4]!;
          curY += args[i + 5]!;
          lastCubicCpX = x2;
          lastCubicCpY = y2;
          ops.push(`${tx(x1)} ${ty(y1)} ${tx(x2)} ${ty(y2)} ${tx(curX)} ${ty(curY)} c`);
        }
        break;
      }
      case "S":
      case "s": {
        for (let i = 0; i < args.length; i += 4) {
          const isRel = cmd === "s";
          const x1 =
            prevCmd === "C" || prevCmd === "c" || prevCmd === "S" || prevCmd === "s"
              ? 2 * curX - lastCubicCpX
              : curX;
          const y1 =
            prevCmd === "C" || prevCmd === "c" || prevCmd === "S" || prevCmd === "s"
              ? 2 * curY - lastCubicCpY
              : curY;
          const x2 = isRel ? curX + args[i]! : args[i]!;
          const y2 = isRel ? curY + args[i + 1]! : args[i + 1]!;
          curX = isRel ? curX + args[i + 2]! : args[i + 2]!;
          curY = isRel ? curY + args[i + 3]! : args[i + 3]!;
          lastCubicCpX = x2;
          lastCubicCpY = y2;
          ops.push(`${tx(x1)} ${ty(y1)} ${tx(x2)} ${ty(y2)} ${tx(curX)} ${ty(curY)} c`);
          prevCmd = cmd;
        }
        break;
      }
      case "Q":
      case "q": {
        for (let i = 0; i < args.length; i += 4) {
          const isRel = cmd === "q";
          const qx = isRel ? curX + args[i]! : args[i]!;
          const qy = isRel ? curY + args[i + 1]! : args[i + 1]!;
          const endX = isRel ? curX + args[i + 2]! : args[i + 2]!;
          const endY = isRel ? curY + args[i + 3]! : args[i + 3]!;
          const cp1x = curX + (2 / 3) * (qx - curX);
          const cp1y = curY + (2 / 3) * (qy - curY);
          const cp2x = endX + (2 / 3) * (qx - endX);
          const cp2y = endY + (2 / 3) * (qy - endY);
          lastQuadCpX = qx;
          lastQuadCpY = qy;
          curX = endX;
          curY = endY;
          ops.push(
            `${tx(cp1x)} ${ty(cp1y)} ${tx(cp2x)} ${ty(cp2y)} ${tx(curX)} ${ty(curY)} c`
          );
        }
        break;
      }
      case "T":
      case "t": {
        for (let i = 0; i < args.length; i += 2) {
          const isRel = cmd === "t";
          const qx =
            prevCmd === "Q" || prevCmd === "q" || prevCmd === "T" || prevCmd === "t"
              ? 2 * curX - lastQuadCpX
              : curX;
          const qy =
            prevCmd === "Q" || prevCmd === "q" || prevCmd === "T" || prevCmd === "t"
              ? 2 * curY - lastQuadCpY
              : curY;
          const endX = isRel ? curX + args[i]! : args[i]!;
          const endY = isRel ? curY + args[i + 1]! : args[i + 1]!;
          const cp1x = curX + (2 / 3) * (qx - curX);
          const cp1y = curY + (2 / 3) * (qy - curY);
          const cp2x = endX + (2 / 3) * (qx - endX);
          const cp2y = endY + (2 / 3) * (qy - endY);
          lastQuadCpX = qx;
          lastQuadCpY = qy;
          curX = endX;
          curY = endY;
          ops.push(
            `${tx(cp1x)} ${ty(cp1y)} ${tx(cp2x)} ${ty(cp2y)} ${tx(curX)} ${ty(curY)} c`
          );
          prevCmd = cmd;
        }
        break;
      }
      case "A":
      case "a": {
        const isRel = cmd === "a";
        for (let i = 0; i < args.length; i += 7) {
          const rx = args[i]!;
          const ry = args[i + 1]!;
          const rot = args[i + 2]!;
          const laf = args[i + 3]!;
          const sf = args[i + 4]!;
          const endX = isRel ? curX + args[i + 5]! : args[i + 5]!;
          const endY = isRel ? curY + args[i + 6]! : args[i + 6]!;
          const cubics = arcToCubicBeziers(
            curX,
            curY,
            rx,
            ry,
            rot,
            laf,
            sf,
            endX,
            endY
          );
          for (const [x1, y1, x2, y2, ex, ey] of cubics) {
            ops.push(`${tx(x1)} ${ty(y1)} ${tx(x2)} ${ty(y2)} ${tx(ex)} ${ty(ey)} c`);
          }
          curX = endX;
          curY = endY;
        }
        break;
      }
      case "Z":
      case "z": {
        ops.push("h");
        curX = subStartX;
        curY = subStartY;
        break;
      }
    }
    prevCmd = cmd;
  }

  return ops.join("\n");
}

/**
 * Generates a valid, self-contained PDF 1.4 document containing true vector
 * paths (`m`, `l`, `c`, `h`, `f`, `f*`) and ExtGState alpha transparency.
 */
export function buildVectorPdfBytes(
  asset: IconVariantAsset,
  options: VectorPdfExportOptions = {}
): Uint8Array {
  const pageSizePt = options.pageSizePt ?? 96;
  const { name, style } = asset;
  const standaloneSvg = buildStandaloneSvg(asset, options);
  const layers = extractSvgVectorLayers(standaloneSvg);

  // Collect unique opacity values to register ExtGState entries
  const uniqueOpacities = Array.from(new Set(layers.map((l) => l.opacity)));
  const gsMap = new Map<number, string>();
  uniqueOpacities.forEach((op, index) => {
    gsMap.set(op, `GS${index + 1}`);
  });

  const streamCommands: string[] = [];
  for (const layer of layers) {
    const [r, g, b] = hexToPdfRgb(layer.fillHex);
    const gsName = gsMap.get(layer.opacity) ?? "GS1";
    const pathOps = svgPathToPdfOperators(layer.d, pageSizePt);
    if (!pathOps) continue;
    const fillOp = layer.fillRule === "evenodd" ? "f*" : "f";
    streamCommands.push(
      "q",
      `/${gsName} gs`,
      `${r} ${g} ${b} rg`,
      pathOps,
      fillOp,
      "Q"
    );
  }

  const contentStream = streamCommands.join("\n") + "\n";
  const extGStateEntries = uniqueOpacities
    .map((op) => {
      const gsName = gsMap.get(op)!;
      return `/${gsName} << /Type /ExtGState /ca ${op} /CA ${op} >>`;
    })
    .join(" ");

  const objects: string[] = [
    `1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n`,
    `2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n`,
    `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageSizePt} ${pageSizePt}] /Resources << /ExtGState << ${extGStateEntries} >> >> /Contents 4 0 R >>\nendobj\n`,
    `4 0 obj\n<< /Length ${contentStream.length} >>\nstream\n${contentStream}endstream\nendobj\n`,
    `5 0 obj\n<< /Title (Slatico Icon - ${name} (${style})) /Creator (Slatico by Infitus Creative Studio) /Producer (Slatico Vector PDF Engine) >>\nendobj\n`
  ];

  const header = "%PDF-1.4\n";
  const offsets: number[] = [];
  let body = "";
  let currentOffset = header.length;

  for (const obj of objects) {
    offsets.push(currentOffset);
    body += obj;
    currentOffset += obj.length;
  }

  const xrefOffset = currentOffset;
  let xref = `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const off of offsets) {
    xref += `${String(off).padStart(10, "0")} 00000 n \n`;
  }

  const trailer = `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R /Info 5 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;
  const pdfText = header + body + xref + trailer;

  return new TextEncoder().encode(pdfText);
}

export function downloadVectorPdf(
  asset: IconVariantAsset,
  options: VectorPdfExportOptions = {}
): Uint8Array {
  const { name, style } = asset;
  const bytes = buildVectorPdfBytes(asset, options);
  const blob = new Blob([bytes.buffer as ArrayBuffer], { type: "application/pdf" });
  const fileName = `${getExportFileBaseName(name, style)}.pdf`;
  triggerBlobDownload(blob, fileName);
  return bytes;
}
