import { useState, type ComponentType, type ReactElement } from "react";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import {
  ICON_NAMES,
  SLATICO_STYLES,
  type SlaticoIconName,
  type SlaticoStyle
} from "@slatico/core";
import {
  BellIcon,
  CloudCheckIcon,
  CloudIcon,
  CreditCardIcon,
  EnvelopeIcon,
  EnvelopeOpenIcon,
  GearIcon,
  HouseIcon,
  LayoutDashboardIcon,
  LockIcon,
  LockOpenIcon,
  MagnifyingGlassIcon,
  MinusIcon,
  PencilIcon,
  PlusIcon,
  ShieldCheckIcon,
  ShieldIcon,
  SlidersHorizontalIcon,
  TrashIcon,
  TrashXIcon,
  TrendUpIcon,
  UserIcon,
  WalletIcon,
  type SlaticoNativeIconProps
} from "@slatico/react-native";
// Verify direct subpath tree-shakeable imports alongside barrel imports
import { ShieldCheckColorIcon } from "@slatico/react-native/icons/shield-check";
import { WalletDuotoneIcon } from "@slatico/react-native/icons/wallet";

export const ICON_COMPONENTS: Readonly<
  Record<SlaticoIconName, ComponentType<SlaticoNativeIconProps>>
> = {
  bell: BellIcon,
  cloud: CloudIcon,
  "cloud-check": CloudCheckIcon,
  "credit-card": CreditCardIcon,
  envelope: EnvelopeIcon,
  "envelope-open": EnvelopeOpenIcon,
  gear: GearIcon,
  house: HouseIcon,
  "layout-dashboard": LayoutDashboardIcon,
  lock: LockIcon,
  "lock-open": LockOpenIcon,
  "magnifying-glass": MagnifyingGlassIcon,
  minus: MinusIcon,
  pencil: PencilIcon,
  plus: PlusIcon,
  shield: ShieldIcon,
  "shield-check": ShieldCheckIcon,
  "sliders-horizontal": SlidersHorizontalIcon,
  trash: TrashIcon,
  "trash-x": TrashXIcon,
  "trend-up": TrendUpIcon,
  user: UserIcon,
  wallet: WalletIcon
};

const SIZE_OPTIONS = [16, 20, 24, 32, 40, 48] as const;

const PRIMARY_COLOR_PRESETS = [
  { label: "Ink", hex: "#09090B" },
  { label: "Blue", hex: "#2563EB" },
  { label: "Emerald", hex: "#059669" },
  { label: "Violet", hex: "#7C3AED" },
  { label: "Rose", hex: "#E11D48" },
  { label: "Snow", hex: "#F8FAFC" }
] as const;

const SECONDARY_COLOR_PRESETS = [
  { label: "Coral", hex: "#FF6040" },
  { label: "Cyan", hex: "#06B6D4" },
  { label: "Amber", hex: "#F59E0B" },
  { label: "Pink", hex: "#EC4899" },
  { label: "Mint", hex: "#10B981" }
] as const;

const OPACITY_OPTIONS = [0.15, 0.22, 0.35, 0.5] as const;

export interface SlaticoShowcaseProps {
  readonly initialStyle?: SlaticoStyle;
  readonly initialDarkTheme?: boolean;
  readonly showAll161MatrixByDefault?: boolean;
}

export default function App(props: SlaticoShowcaseProps): ReactElement {
  const {
    initialStyle = "regular",
    initialDarkTheme = false,
    showAll161MatrixByDefault = false
  } = props;
  const [selectedStyle, setSelectedStyle] = useState<SlaticoStyle>(initialStyle);
  const [iconSize, setIconSize] = useState<number>(28);
  const [primaryColor, setPrimaryColor] = useState<string>(
    initialDarkTheme ? "#F8FAFC" : "#09090B"
  );
  const [secondaryColor, setSecondaryColor] = useState<string>("#FF6040");
  const [secondaryOpacity, setSecondaryOpacity] = useState<number>(0.25);
  const [isDarkTheme, setIsDarkTheme] = useState<boolean>(initialDarkTheme);
  const [showAll161, setShowAll161] = useState<boolean>(showAll161MatrixByDefault);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredIconNames = ICON_NAMES.filter((name) =>
    normalizedQuery.length === 0 ? true : name.includes(normalizedQuery)
  );

  const surfaceBg = isDarkTheme ? "#09090B" : "#F8FAFC";
  const cardBg = isDarkTheme ? "#18181B" : "#FFFFFF";
  const borderColor = isDarkTheme ? "#27272A" : "#E4E4E7";
  const textPrimary = isDarkTheme ? "#FAFAFA" : "#09090B";
  const textSecondary = isDarkTheme ? "#A1A1AA" : "#52525B";

  const handleToggleTheme = (): void => {
    const nextDark = !isDarkTheme;
    setIsDarkTheme(nextDark);
    if (nextDark && primaryColor === "#09090B") {
      setPrimaryColor("#F8FAFC");
    } else if (!nextDark && primaryColor === "#F8FAFC") {
      setPrimaryColor("#09090B");
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: surfaceBg }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
          <View style={styles.headerRow}>
            <View style={styles.headerTitles}>
              <Text style={[styles.title, { color: textPrimary }]}>
                Slatico React Native
              </Text>
              <Text style={[styles.subtitle, { color: textSecondary }]}>
                {ICON_NAMES.length} families × {SLATICO_STYLES.length} styles ={" "}
                {ICON_NAMES.length * SLATICO_STYLES.length} native vector variants
              </Text>
            </View>
            <View style={styles.headerBadges}>
              <ShieldCheckColorIcon size={28} title="Verified Native" />
              <WalletDuotoneIcon
                size={28}
                color={primaryColor}
                secondaryColor={secondaryColor}
                secondaryOpacity={secondaryOpacity}
                title="Subpath Duotone Wallet"
              />
            </View>
          </View>
        </View>

        {/* Controls */}
        <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Filter 23 icon families by name..."
            placeholderTextColor={textSecondary}
            style={[
              styles.searchInput,
              { color: textPrimary, borderColor, backgroundColor: surfaceBg }
            ]}
          />

          {/* Style Selector */}
          <Text style={[styles.sectionLabel, { color: textSecondary }]}>
            Active Style ({selectedStyle})
          </Text>
          <View style={styles.chipRow}>
            {SLATICO_STYLES.map((styleName) => {
              const active = selectedStyle === styleName && !showAll161;
              return (
                <Pressable
                  key={styleName}
                  onPress={() => {
                    setSelectedStyle(styleName);
                    setShowAll161(false);
                  }}
                  style={[
                    styles.chip,
                    {
                      borderColor: active ? "#FF6040" : borderColor,
                      backgroundColor: active ? "#FF6040" : surfaceBg
                    }
                  ]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      { color: active ? "#FFFFFF" : textPrimary }
                    ]}
                  >
                    {styleName}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Size Selector */}
          <Text style={[styles.sectionLabel, { color: textSecondary }]}>
            Size: {iconSize}dp
          </Text>
          <View style={styles.chipRow}>
            {SIZE_OPTIONS.map((sz) => {
              const active = iconSize === sz;
              return (
                <Pressable
                  key={sz}
                  onPress={() => setIconSize(sz)}
                  style={[
                    styles.chip,
                    {
                      borderColor: active ? "#2563EB" : borderColor,
                      backgroundColor: active ? "#2563EB" : surfaceBg
                    }
                  ]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      { color: active ? "#FFFFFF" : textPrimary }
                    ]}
                  >
                    {sz}dp
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Primary Color Selector */}
          <Text style={[styles.sectionLabel, { color: textSecondary }]}>
            Primary Color ({primaryColor})
          </Text>
          <View style={styles.chipRow}>
            {PRIMARY_COLOR_PRESETS.map((preset) => {
              const active = primaryColor === preset.hex;
              return (
                <Pressable
                  key={preset.hex}
                  onPress={() => setPrimaryColor(preset.hex)}
                  style={[
                    styles.chip,
                    {
                      borderColor: active ? "#FF6040" : borderColor,
                      backgroundColor: surfaceBg
                    }
                  ]}
                >
                  <View
                    style={[styles.colorSwatch, { backgroundColor: preset.hex }]}
                  />
                  <Text style={[styles.chipText, { color: textPrimary }]}>
                    {preset.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Duotone Secondary Color & Opacity */}
          <Text style={[styles.sectionLabel, { color: textSecondary }]}>
            Duotone Secondary ({secondaryColor} @ {Math.round(secondaryOpacity * 100)}%)
          </Text>
          <View style={styles.chipRow}>
            {SECONDARY_COLOR_PRESETS.map((preset) => {
              const active = secondaryColor === preset.hex;
              return (
                <Pressable
                  key={preset.hex}
                  onPress={() => setSecondaryColor(preset.hex)}
                  style={[
                    styles.chip,
                    {
                      borderColor: active ? "#FF6040" : borderColor,
                      backgroundColor: surfaceBg
                    }
                  ]}
                >
                  <View
                    style={[styles.colorSwatch, { backgroundColor: preset.hex }]}
                  />
                  <Text style={[styles.chipText, { color: textPrimary }]}>
                    {preset.label}
                  </Text>
                </Pressable>
              );
            })}
            {OPACITY_OPTIONS.map((op) => {
              const active = secondaryOpacity === op;
              return (
                <Pressable
                  key={op}
                  onPress={() => setSecondaryOpacity(op)}
                  style={[
                    styles.chip,
                    {
                      borderColor: active ? "#059669" : borderColor,
                      backgroundColor: active ? "#059669" : surfaceBg
                    }
                  ]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      { color: active ? "#FFFFFF" : textPrimary }
                    ]}
                  >
                    {Math.round(op * 100)}%
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Theme & Matrix Toggles */}
          <View style={styles.toggleRow}>
            <Pressable
              onPress={handleToggleTheme}
              style={[styles.toggleButton, { borderColor, backgroundColor: surfaceBg }]}
            >
              <Text style={[styles.chipText, { color: textPrimary }]}>
                Theme: {isDarkTheme ? "Dark" : "Light"}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setShowAll161(!showAll161)}
              style={[
                styles.toggleButton,
                {
                  borderColor: showAll161 ? "#FF6040" : borderColor,
                  backgroundColor: showAll161 ? "#FF6040" : surfaceBg
                }
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  { color: showAll161 ? "#FFFFFF" : textPrimary }
                ]}
              >
                {showAll161 ? "Showing All 161 Variants" : "Show All 161 Matrix"}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* 7-Style Comparison Strip */}
        <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
          <Text style={[styles.sectionTitle, { color: textPrimary }]}>
            7-Style Comparison (house)
          </Text>
          <View style={styles.comparisonRow}>
            {SLATICO_STYLES.map((styleName) => (
              <View
                key={styleName}
                style={[
                  styles.comparisonCell,
                  { borderColor, backgroundColor: surfaceBg }
                ]}
              >
                <HouseIcon
                  variant={styleName}
                  size={iconSize}
                  color={primaryColor}
                  secondaryColor={secondaryColor}
                  secondaryOpacity={secondaryOpacity}
                  title={`house ${styleName}`}
                />
                <Text style={[styles.cellCaption, { color: textSecondary }]}>
                  {styleName}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Icon Gallery: Either Single Style or Full 161-Variant Matrix */}
        {showAll161 ? (
          <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
            <Text style={[styles.sectionTitle, { color: textPrimary }]}>
              Complete 161-Variant Matrix ({filteredIconNames.length} × 7)
            </Text>
            {filteredIconNames.map((iconName) => {
              const IconComponent = ICON_COMPONENTS[iconName];
              return (
                <View
                  key={iconName}
                  style={[styles.matrixRow, { borderColor }]}
                >
                  <Text style={[styles.matrixLabel, { color: textPrimary }]}>
                    {iconName}
                  </Text>
                  <View style={styles.matrixIcons}>
                    {SLATICO_STYLES.map((styleName) => (
                      <View key={styleName} style={styles.matrixIconCell}>
                        <IconComponent
                          variant={styleName}
                          size={iconSize}
                          color={primaryColor}
                          secondaryColor={secondaryColor}
                          secondaryOpacity={secondaryOpacity}
                          title={`${iconName} (${styleName})`}
                        />
                      </View>
                    ))}
                  </View>
                </View>
              );
            })}
          </View>
        ) : (
          <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
            <Text style={[styles.sectionTitle, { color: textPrimary }]}>
              Icon Gallery — {selectedStyle} ({filteredIconNames.length} of{" "}
              {ICON_NAMES.length})
            </Text>
            <View style={styles.galleryGrid}>
              {filteredIconNames.map((iconName) => {
                const IconComponent = ICON_COMPONENTS[iconName];
                return (
                  <View
                    key={iconName}
                    style={[
                      styles.galleryCell,
                      { borderColor, backgroundColor: surfaceBg }
                    ]}
                  >
                    <IconComponent
                      variant={selectedStyle}
                      size={iconSize}
                      color={primaryColor}
                      secondaryColor={secondaryColor}
                      secondaryOpacity={secondaryOpacity}
                      title={`${iconName} (${selectedStyle})`}
                    />
                    <Text
                      numberOfLines={1}
                      style={[styles.cellCaption, { color: textSecondary }]}
                    >
                      {iconName}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1
  },
  scrollContent: {
    padding: 16,
    gap: 14
  },
  card: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    gap: 10
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  headerTitles: {
    flex: 1,
    gap: 2
  },
  headerBadges: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  title: {
    fontSize: 18,
    fontWeight: "700"
  },
  subtitle: {
    fontSize: 12
  },
  searchInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "600",
    marginTop: 2
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700"
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 9,
    paddingVertical: 5
  },
  chipText: {
    fontSize: 11,
    fontWeight: "600"
  },
  colorSwatch: {
    width: 10,
    height: 10,
    borderRadius: 5
  },
  toggleRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4
  },
  toggleButton: {
    flex: 1,
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 8
  },
  comparisonRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  comparisonCell: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    minWidth: 68,
    gap: 4
  },
  galleryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  galleryCell: {
    width: "31%",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 6,
    gap: 6
  },
  cellCaption: {
    fontSize: 10
  },
  matrixRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    paddingVertical: 8
  },
  matrixLabel: {
    fontSize: 11,
    fontWeight: "600",
    width: 110
  },
  matrixIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap"
  },
  matrixIconCell: {
    padding: 2
  }
});
