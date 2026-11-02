"use client";

import { useEffect, useState } from "react";
import { SLATICO_STYLES, type SlaticoStyle } from "@slatico/core";
import { getCatalogClient, type CatalogFamily } from "./catalog-client";
import type { IconVariantAsset } from "./icon-asset";

/** Family metadata for a catalog index; synchronous when its shard is already cached. */
export function useCatalogFamily(index: number): CatalogFamily | undefined {
  const client = getCatalogClient();
  const [family, setFamily] = useState(() => client.peekFamily(index));
  useEffect(() => {
    let active = true;
    const cached = client.peekFamily(index);
    setFamily(cached);
    if (!cached) {
      client.getFamily(index).then(
        (value) => active && setFamily(value),
        () => undefined
      );
    }
    return () => {
      active = false;
    };
  }, [client, index]);
  return family;
}

/** One variant's SVG data; synchronous when its shard is already cached. */
export function useCatalogVariant(index: number, style: SlaticoStyle): IconVariantAsset | undefined {
  const client = getCatalogClient();
  const [asset, setAsset] = useState(() => client.peekVariant(index, style));
  useEffect(() => {
    let active = true;
    const cached = client.peekVariant(index, style);
    setAsset(cached);
    if (!cached) {
      client.getVariant(index, style).then(
        (value) => active && setAsset(value),
        () => undefined
      );
    }
    return () => {
      active = false;
    };
  }, [client, index, style]);
  return asset;
}

/** All seven variants of one family (used by the detail drawer). */
export function useFamilyVariants(index: number): Partial<Record<SlaticoStyle, IconVariantAsset>> {
  const client = getCatalogClient();
  const peekAll = () =>
    Object.fromEntries(
      SLATICO_STYLES.flatMap((style) => {
        const asset = client.peekVariant(index, style);
        return asset ? [[style, asset]] : [];
      })
    ) as Partial<Record<SlaticoStyle, IconVariantAsset>>;
  const [variants, setVariants] = useState(peekAll);
  useEffect(() => {
    let active = true;
    setVariants(peekAll());
    Promise.all(SLATICO_STYLES.map((style) => client.getVariant(index, style))).then(
      (assets) => {
        if (!active) return;
        setVariants(
          Object.fromEntries(assets.map((asset) => [asset.style, asset])) as Record<
            SlaticoStyle,
            IconVariantAsset
          >
        );
      },
      () => undefined
    );
    return () => {
      active = false;
    };
  }, [client, index]);
  return variants;
}
