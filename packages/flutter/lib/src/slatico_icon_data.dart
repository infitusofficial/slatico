/// All seven official Slatico icon styles.
enum SlaticoStyle {
  /// 1.0px ultra-light precision stroke (`Slatico Thin` TTF font).
  thin(
    isMonochrome: true,
    supportsIconData: true,
    strokeWidth: 1.0,
    fontFamily: 'Slatico Thin',
  ),

  /// 1.5px refined light stroke (`Slatico Light` TTF font).
  light(
    isMonochrome: true,
    supportsIconData: true,
    strokeWidth: 1.5,
    fontFamily: 'Slatico Light',
  ),

  /// 2.0px balanced default stroke (`Slatico Regular` TTF font).
  regular(
    isMonochrome: true,
    supportsIconData: true,
    strokeWidth: 2.0,
    fontFamily: 'Slatico Regular',
  ),

  /// 3.0px high-emphasis bold stroke (`Slatico Bold` TTF font).
  bold(
    isMonochrome: true,
    supportsIconData: true,
    strokeWidth: 3.0,
    fontFamily: 'Slatico Bold',
  ),

  /// Solid filled silhouette with negative-space cutouts (`Slatico Fill` TTF font).
  fill(
    isMonochrome: true,
    supportsIconData: true,
    strokeWidth: null,
    fontFamily: 'Slatico Fill',
  ),

  /// Two-tone layered vector artwork (`flutter_svg` vector rendering).
  duotone(
    isMonochrome: false,
    supportsIconData: false,
    strokeWidth: 1.75,
    fontFamily: null,
  ),

  /// Expressive multicolor vector artwork and gradients (`flutter_svg` vector rendering).
  color(
    isMonochrome: false,
    supportsIconData: false,
    strokeWidth: null,
    fontFamily: null,
  );

  const SlaticoStyle({
    required this.isMonochrome,
    required this.supportsIconData,
    required this.strokeWidth,
    required this.fontFamily,
  });

  /// Whether this style uses a single foreground color (`true` for `thin`, `light`, `regular`, `bold`, `fill`).
  final bool isMonochrome;

  /// Whether this style can be used directly with Flutter's [Icon] widget via [IconData].
  final bool supportsIconData;

  /// Nominal stroke width on the 24x24 optical grid, or `null` for filled/multicolor styles.
  final double? strokeWidth;

  /// Bundled TTF font family name for monochrome styles, or `null` for SVG vector styles.
  final String? fontFamily;
}
