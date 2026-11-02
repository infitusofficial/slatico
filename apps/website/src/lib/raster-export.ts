import type { IconVariantAsset } from "./icon-asset";
import {
  buildStandaloneSvg,
  getExportFileBaseName,
  triggerBlobDownload,
  type StandaloneSvgOptions
} from "./svg-export";

export const RASTER_EXPORT_SIZES = [24, 48, 64, 128, 256, 512, 1024] as const;
export type RasterExportSize = (typeof RASTER_EXPORT_SIZES)[number];

export interface RasterExportOptions extends StandaloneSvgOptions {
  readonly dimension: number;
  readonly backgroundColor?: string | null;
}

export interface RasterExportResult {
  readonly blob: Blob;
  readonly mimeType: "image/png" | "image/webp";
  readonly fileName: string;
  readonly width: number;
  readonly height: number;
}

/**
 * Checks whether the current browser Canvas implementation natively encodes `image/webp`.
 */
export function isCanvasWebpSupported(): boolean {
  if (typeof document === "undefined") {
    return false;
  }
  try {
    const canvas = document.createElement("canvas");
    canvas.width = 2;
    canvas.height = 2;
    const dataUrl = canvas.toDataURL("image/webp");
    return dataUrl.startsWith("data:image/webp");
  } catch {
    return false;
  }
}

/**
 * Verify whether a binary buffer/Uint8Array has a valid RIFF....WEBP header.
 */
export function hasValidWebpMagicBytes(bytes: Uint8Array): boolean {
  if (bytes.byteLength < 12) {
    return false;
  }
  // 'RIFF' at 0..3 and 'WEBP' at 8..11
  return (
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  );
}

/**
 * Verify whether a binary buffer/Uint8Array has a valid PNG signature.
 */
export function hasValidPngMagicBytes(bytes: Uint8Array): boolean {
  if (bytes.byteLength < 8) {
    return false;
  }
  return (
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  );
}

async function renderSvgToCanvas(
  asset: IconVariantAsset,
  options: RasterExportOptions
): Promise<HTMLCanvasElement> {
  const { name, style } = asset;
  if (typeof document === "undefined") {
    throw new Error("Canvas raster export requires a browser environment.");
  }

  const dimension = Math.max(16, Math.min(4096, Math.round(options.dimension)));
  const svgMarkup = buildStandaloneSvg(asset, {
    ...options,
    size: dimension,
    backgroundColor: null // We paint background directly on canvas if specified
  });

  const svgBlob = new Blob([svgMarkup], { type: "image/svg+xml;charset=utf-8" });
  const objectUrl = URL.createObjectURL(svgBlob);

  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.decoding = "async";
      image.onload = () => resolve(image);
      image.onerror = () =>
        reject(new Error(`Failed to decode SVG artwork for ${name} (${style}).`));
      image.src = objectUrl;
    });

    const canvas = document.createElement("canvas");
    canvas.width = dimension;
    canvas.height = dimension;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("2D Canvas context is unavailable.");
    }

    ctx.clearRect(0, 0, dimension, dimension);
    if (options.backgroundColor && options.backgroundColor !== "transparent") {
      ctx.fillStyle = options.backgroundColor;
      ctx.fillRect(0, 0, dimension, dimension);
    }

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, 0, 0, dimension, dimension);

    return canvas;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  mimeType: "image/png" | "image/webp",
  quality = 0.96
): Promise<Blob> {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error(`Canvas failed to encode ${mimeType}.`));
          return;
        }
        resolve(blob);
      },
      mimeType,
      quality
    );
  });
}

export async function exportIconToPng(
  asset: IconVariantAsset,
  options: RasterExportOptions
): Promise<RasterExportResult> {
  const { name, style } = asset;
  const canvas = await renderSvgToCanvas(asset, options);
  const blob = await canvasToBlob(canvas, "image/png");
  const fileName = `${getExportFileBaseName(name, style, canvas.width)}.png`;
  triggerBlobDownload(blob, fileName);
  return {
    blob,
    mimeType: "image/png",
    fileName,
    width: canvas.width,
    height: canvas.height
  };
}

export async function exportIconToWebp(
  asset: IconVariantAsset,
  options: RasterExportOptions
): Promise<RasterExportResult> {
  if (!isCanvasWebpSupported()) {
    throw new Error(
      "Your current browser does not support native WebP canvas encoding. Please export as PNG or SVG instead."
    );
  }

  const { name, style } = asset;
  const canvas = await renderSvgToCanvas(asset, options);
  const blob = await canvasToBlob(canvas, "image/webp", 0.96);

  if (blob.type !== "image/webp") {
    throw new Error(
      "Browser fell back to a non-WebP format. Please use PNG or SVG export."
    );
  }

  const headerBytes = new Uint8Array(await blob.slice(0, 12).arrayBuffer());
  if (!hasValidWebpMagicBytes(headerBytes)) {
    throw new Error("Encoded output did not contain valid RIFF/WEBP headers.");
  }

  const fileName = `${getExportFileBaseName(name, style, canvas.width)}.webp`;
  triggerBlobDownload(blob, fileName);
  return {
    blob,
    mimeType: "image/webp",
    fileName,
    width: canvas.width,
    height: canvas.height
  };
}
