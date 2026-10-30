export {
  MASTER_VIEWBOX,
  SLATICO_STYLES,
  SLATICO_STYLE_SPECS,
  SLATICO_TIERS,
  type SlaticoCatalog,
  type SlaticoIconEntry,
  type SlaticoIconVariantMetadata,
  type SlaticoStyle,
  type SlaticoStyleSpec,
  type SlaticoTier
} from "./types.js";

export {
  getIconComponentName,
  isValidIconName,
  isValidSlaticoStyle,
  toPascalCase
} from "./utils.js";

export {
  ICON_CATALOG,
  ICON_NAMES,
  type SlaticoIconName
} from "./generated/catalog.js";
