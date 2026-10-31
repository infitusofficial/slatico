"use client";

import { useState } from "react";
import type { EnrichedCatalogIcon } from "../../lib/catalog";
import {
  IconDetailPanel,
  type IconCustomizerState
} from "./icon-detail-panel";

export function StandaloneIconDetailClient({
  icon
}: {
  readonly icon: EnrichedCatalogIcon;
}) {
  const [customizer, setCustomizer] = useState<IconCustomizerState>({
    style: "regular",
    size: 32,
    primaryColor: "currentColor",
    secondaryColor: "var(--primary)",
    secondaryOpacity: 0.25,
    previewBg: "checkerboard"
  });

  const updateCustomizer = (patch: Partial<IconCustomizerState>) => {
    setCustomizer((prev) => ({ ...prev, ...patch }));
  };

  return (
    <IconDetailPanel
      icon={icon}
      customizer={customizer}
      onCustomizerChange={updateCustomizer}
      mode="inline"
    />
  );
}
