import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import zlib from "node:zlib";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, "..");
const PUBLIC_DIR = path.join(ROOT_DIR, "apps", "website", "public");
const BRAND_ICON_SVG_PATH = path.join(PUBLIC_DIR, "brand", "icon.svg");

interface Point {
  x: number;
  y: number;
}

interface PolygonContour {
  points: Point[];
}

function parseSvgNumberList(raw: string): number[] {
  const matches = raw.match(/-?\d*\.?\d+(?:e[-+]?\d+)?/gi);
  return matches ? matches.map(Number) : [];
}

/**
 * Sample a cubic Bezier curve into line segments for supersampled scanline rasterization.
 */
function sampleCubicBezier(
  p0: Point,
  p1: Point,
  p2: Point,
  p3: Point,
  steps = 20
): Point[] {
  const result: Point[] = [];
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const mt = 1 - t;
    const x =
      mt * mt * mt * p0.x +
      3 * mt * mt * t * p1.x +
      3 * mt * t * t * p2.x +
      t * t * t * p3.x;
    const y =
      mt * mt * mt * p0.y +
      3 * mt * mt * t * p1.y +
      3 * mt * t * t * p2.y +
      t * t * t * p3.y;
    result.push({ x, y });
  }
  return result;
}

/**
 * Parse an SVG path `d` attribute (supporting M, L, H, V, C, Z) into closed polygon contours.
 */
function parsePathToContours(d: string): PolygonContour[] {
  const contours: PolygonContour[] = [];
  const tokenRegex = /([MmLlHhVvCcZz])([^MmLlHhVvCcZz]*)/g;
  let current: Point = { x: 0, y: 0 };
  let start: Point = { x: 0, y: 0 };
  let points: Point[] = [];

  let match: RegExpExecArray | null;
  while ((match = tokenRegex.exec(d)) !== null) {
    const cmd = match[1]!;
    const nums = parseSvgNumberList(match[2] ?? "");

    switch (cmd) {
      case "M": {
        if (points.length >= 3) {
          contours.push({ points });
        }
        points = [];
        for (let i = 0; i < nums.length; i += 2) {
          current = { x: nums[i]!, y: nums[i + 1]! };
          if (i === 0) {
            start = { ...current };
          }
          points.push({ ...current });
        }
        break;
      }
      case "m": {
        if (points.length >= 3) {
          contours.push({ points });
        }
        points = [];
        for (let i = 0; i < nums.length; i += 2) {
          current = { x: current.x + nums[i]!, y: current.y + nums[i + 1]! };
          if (i === 0) {
            start = { ...current };
          }
          points.push({ ...current });
        }
        break;
      }
      case "L": {
        for (let i = 0; i < nums.length; i += 2) {
          current = { x: nums[i]!, y: nums[i + 1]! };
          points.push({ ...current });
        }
        break;
      }
      case "l": {
        for (let i = 0; i < nums.length; i += 2) {
          current = { x: current.x + nums[i]!, y: current.y + nums[i + 1]! };
          points.push({ ...current });
        }
        break;
      }
      case "H": {
        for (const x of nums) {
          current = { x, y: current.y };
          points.push({ ...current });
        }
        break;
      }
      case "h": {
        for (const dx of nums) {
          current = { x: current.x + dx, y: current.y };
          points.push({ ...current });
        }
        break;
      }
      case "V": {
        for (const y of nums) {
          current = { x: current.x, y };
          points.push({ ...current });
        }
        break;
      }
      case "v": {
        for (const dy of nums) {
          current = { x: current.x, y: current.y + dy };
          points.push({ ...current });
        }
        break;
      }
      case "C": {
        for (let i = 0; i < nums.length; i += 6) {
          const p1 = { x: nums[i]!, y: nums[i + 1]! };
          const p2 = { x: nums[i + 2]!, y: nums[i + 3]! };
          const p3 = { x: nums[i + 4]!, y: nums[i + 5]! };
          points.push(...sampleCubicBezier(current, p1, p2, p3, 24));
          current = p3;
        }
        break;
      }
      case "c": {
        for (let i = 0; i < nums.length; i += 6) {
          const p1 = { x: current.x + nums[i]!, y: current.y + nums[i + 1]! };
          const p2 = { x: current.x + nums[i + 2]!, y: current.y + nums[i + 3]! };
          const p3 = { x: current.x + nums[i + 4]!, y: current.y + nums[i + 5]! };
          points.push(...sampleCubicBezier(current, p1, p2, p3, 24));
          current = p3;
        }
        break;
      }
      case "Z":
      case "z": {
        current = { ...start };
        if (points.length >= 3) {
          contours.push({ points });
        }
        points = [];
        break;
      }
    }
  }

  if (points.length >= 3) {
    contours.push({ points });
  }
  return contours;
}

function pointInContours(x: number, y: number, contours: PolygonContour[]): boolean {
  let inside = false;
  for (const contour of contours) {
    const pts = contour.points;
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      const xi = pts[i]!.x;
      const yi = pts[i]!.y;
      const xj = pts[j]!.x;
      const yj = pts[j]!.y;
      const intersect =
        yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi + 1e-12) + xi;
      if (intersect) {
        inside = !inside;
      }
    }
  }
  return inside;
}

function insideRoundedRect(
  x: number,
  y: number,
  width: number,
  height: number,
  rx: number
): boolean {
  if (x < 0 || x > width || y < 0 || y > height) {
    return false;
  }
  const cx = Math.max(rx, Math.min(width - rx, x));
  const cy = Math.max(rx, Math.min(height - rx, y));
  const dx = x - cx;
  const dy = y - cy;
  return dx * dx + dy * dy <= rx * rx;
}

function parseHexRgb(hex: string): [number, number, number] {
  const clean = hex.replace("#", "").trim();
  return [
    parseInt(clean.slice(0, 2), 16),
    parseInt(clean.slice(2, 4), 16),
    parseInt(clean.slice(4, 6), 16)
  ];
}

interface ExtractedBrandIconGeometry {
  viewBoxSize: number;
  rectRadius: number;
  bgRgb: [number, number, number];
  primaryMarkContours: PolygonContour[];
  secondaryMarkContours: PolygonContour[];
}

function extractBrandIconGeometry(svgContent: string): ExtractedBrandIconGeometry {
  const rxMatch = svgContent.match(/<rect[^>]*\brx="([^"]+)"/);
  const fillMatch = svgContent.match(/<rect[^>]*\bfill="(#[0-9A-Fa-f]{6})"/);
  const stroke0Match = svgContent.match(/<path\s+id="stroke0_[^"]+"\s+d="([^"]+)"/);
  const stroke1Match = svgContent.match(/<path\s+id="stroke1_[^"]+"\s+d="([^"]+)"/);

  if (!stroke0Match || !stroke1Match) {
    throw new Error("Could not extract stroke0/stroke1 paths from brand icon.svg");
  }

  return {
    viewBoxSize: 512,
    rectRadius: rxMatch ? Number(rxMatch[1]) : 140,
    bgRgb: fillMatch ? parseHexRgb(fillMatch[1]!) : [255, 96, 64],
    primaryMarkContours: parsePathToContours(stroke0Match[1]!),
    secondaryMarkContours: parsePathToContours(stroke1Match[1]!)
  };
}

/**
 * Render the brand icon at `size x size` RGBA pixels using 4x4 supersampled anti-aliasing.
 */
function renderBrandIconRgba(size: number, geom: ExtractedBrandIconGeometry): Buffer {
  const rgba = Buffer.alloc(size * size * 4);
  const scale = geom.viewBoxSize / size;
  const subSamples = 4;
  const invSamples = 1 / (subSamples * subSamples);
  const [bgR, bgG, bgB] = geom.bgRgb;

  for (let py = 0; py < size; py++) {
    for (let px = 0; px < size; px++) {
      let accR = 0;
      let accG = 0;
      let accB = 0;
      let accA = 0;

      for (let sy = 0; sy < subSamples; sy++) {
        const vy = (py + (sy + 0.5) / subSamples) * scale;
        for (let sx = 0; sx < subSamples; sx++) {
          const vx = (px + (sx + 0.5) / subSamples) * scale;

          if (!insideRoundedRect(vx, vy, geom.viewBoxSize, geom.viewBoxSize, geom.rectRadius)) {
            continue;
          }

          let r = bgR;
          let g = bgG;
          let b = bgB;

          if (pointInContours(vx, vy, geom.primaryMarkContours)) {
            r = 255;
            g = 255;
            b = 255;
          } else if (pointInContours(vx, vy, geom.secondaryMarkContours)) {
            const alpha = 0.65;
            r = Math.round(255 * alpha + bgR * (1 - alpha));
            g = Math.round(255 * alpha + bgG * (1 - alpha));
            b = Math.round(255 * alpha + bgB * (1 - alpha));
          }

          accR += r;
          accG += g;
          accB += b;
          accA += 255;
        }
      }

      const idx = (py * size + px) * 4;
      const a = Math.round(accA * invSamples);
      if (a > 0) {
        const activeSamples = accA / 255;
        rgba[idx] = Math.round(accR / activeSamples);
        rgba[idx + 1] = Math.round(accG / activeSamples);
        rgba[idx + 2] = Math.round(accB / activeSamples);
        rgba[idx + 3] = a;
      }
    }
  }

  return rgba;
}

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(buf: Buffer): number {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = CRC_TABLE[(c ^ buf[i]!) & 0xff]! ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function makePngChunk(type: string, data: Buffer): Buffer {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, "ascii");
  const crcInput = Buffer.concat([typeBuf, data]);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(crcInput), 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function encodePng(width: number, height: number, rgba: Buffer): Buffer {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  const stride = width * 4;
  const rawScanlines = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    const rowStart = y * (stride + 1);
    rawScanlines[rowStart] = 0; // filter type None
    rgba.copy(rawScanlines, rowStart + 1, y * stride, (y + 1) * stride);
  }

  const compressed = zlib.deflateSync(rawScanlines, { level: 9 });

  return Buffer.concat([
    signature,
    makePngChunk("IHDR", ihdr),
    makePngChunk("IDAT", compressed),
    makePngChunk("IEND", Buffer.alloc(0))
  ]);
}

/**
 * Build a multi-resolution ICO file embedding PNG frames (16x16 and 32x32).
 */
function encodeIco(frames: Array<{ size: number; png: Buffer }>): Buffer {
  const count = frames.length;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type 1 = ICO
  header.writeUInt16LE(count, 4);

  const dirEntries = Buffer.alloc(16 * count);
  let offset = 6 + 16 * count;

  frames.forEach((frame, i) => {
    const entryOffset = i * 16;
    dirEntries[entryOffset] = frame.size >= 256 ? 0 : frame.size;
    dirEntries[entryOffset + 1] = frame.size >= 256 ? 0 : frame.size;
    dirEntries[entryOffset + 2] = 0; // palette count
    dirEntries[entryOffset + 3] = 0; // reserved
    dirEntries.writeUInt16LE(1, entryOffset + 4); // color planes
    dirEntries.writeUInt16LE(32, entryOffset + 6); // bits per pixel
    dirEntries.writeUInt32LE(frame.png.length, entryOffset + 8);
    dirEntries.writeUInt32LE(offset, entryOffset + 12);
    offset += frame.png.length;
  });

  return Buffer.concat([header, dirEntries, ...frames.map((f) => f.png)]);
}

function main(): void {
  mkdirSync(PUBLIC_DIR, { recursive: true });
  const svgContent = readFileSync(BRAND_ICON_SVG_PATH, "utf8");
  const geom = extractBrandIconGeometry(svgContent);

  const targets = [
    { size: 16, fileName: "favicon-16x16.png" },
    { size: 32, fileName: "favicon-32x32.png" },
    { size: 180, fileName: "apple-touch-icon.png" },
    { size: 192, fileName: "android-chrome-192x192.png" },
    { size: 512, fileName: "android-chrome-512x512.png" }
  ] as const;

  const pngBySize = new Map<number, Buffer>();

  for (const target of targets) {
    const rgba = renderBrandIconRgba(target.size, geom);
    const png = encodePng(target.size, target.size, rgba);
    pngBySize.set(target.size, png);
    writeFileSync(path.join(PUBLIC_DIR, target.fileName), png);
    console.log(`Generated ${target.fileName} (${target.size}x${target.size}, ${png.length} bytes)`);
  }

  const ico = encodeIco([
    { size: 16, png: pngBySize.get(16)! },
    { size: 32, png: pngBySize.get(32)! }
  ]);
  writeFileSync(path.join(PUBLIC_DIR, "favicon.ico"), ico);
  console.log(`Generated favicon.ico (16x16 + 32x32, ${ico.length} bytes)`);

  // Ensure public/icon.svg matches public/brand/icon.svg
  writeFileSync(path.join(PUBLIC_DIR, "icon.svg"), svgContent, "utf8");

  const manifest = {
    name: "Slatico by Infitus Creative Studio",
    short_name: "Slatico",
    description:
      "Modern, original, open-source multi-platform SVG icon library across 7 architectural styles.",
    start_url: "/",
    display: "standalone",
    background_color: "#010520",
    theme_color: "#FF6040",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml"
      },
      {
        src: "/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png"
      },
      {
        src: "/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png"
      }
    ]
  };

  writeFileSync(
    path.join(PUBLIC_DIR, "site.webmanifest"),
    JSON.stringify(manifest, null, 2) + "\n",
    "utf8"
  );
  console.log("Generated site.webmanifest");
}

main();
