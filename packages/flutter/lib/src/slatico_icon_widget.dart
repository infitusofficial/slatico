import 'package:flutter/widgets.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'generated/slatico_catalog.g.dart';
import 'generated/slatico_icons.g.dart';
import 'slatico_icon_data.dart';
import 'slatico_theme.dart';

/// Formats a Flutter [Color] into a 6-digit uppercase `#RRGGBB` SVG hex string.
String formatColorToSvgHex(Color color) {
  final int r = (color.r * 255.0).round().clamp(0, 255);
  final int g = (color.g * 255.0).round().clamp(0, 255);
  final int b = (color.b * 255.0).round().clamp(0, 255);
  final String rh = r.toRadixString(16).padLeft(2, '0').toUpperCase();
  final String gh = g.toRadixString(16).padLeft(2, '0').toUpperCase();
  final String bh = b.toRadixString(16).padLeft(2, '0').toUpperCase();
  return '#$rh$gh$bh';
}

/// Resolves the `flutter_svg`-compatible SVG markup for a [SlaticoStyle.duotone] icon
/// with independent primary [color], [secondaryColor], and [secondaryOpacity].
String resolveDuotoneSvgMarkup({
  required SlaticoIconName name,
  required Color primaryColor,
  Color? secondaryColor,
  double? secondaryOpacity,
}) {
  final String template = slaticoDuotoneSvgTemplates[name]!;
  final String primaryHex = formatColorToSvgHex(primaryColor);
  final String secondaryHex =
      formatColorToSvgHex(secondaryColor ?? primaryColor);
  final double resolvedSecondaryOpacity =
      (secondaryOpacity ?? slaticoDuotoneDefaultOpacity[name] ?? 0.2)
          .clamp(0.0, 1.0);

  return template
      .replaceAll('__SLATICO_PRIMARY_COLOR__', primaryHex)
      .replaceAll('__SLATICO_SECONDARY_COLOR__', secondaryHex)
      .replaceAll(
        '__SLATICO_SECONDARY_OPACITY__',
        resolvedSecondaryOpacity.toString(),
      );
}

/// Resolves the `flutter_svg`-compatible SVG markup for a [SlaticoStyle.color] icon
/// with independent customizable [primaryColor] (default `#FF6040`) and
/// [secondaryColor] (default `#000000`).
String resolveColorSvgMarkup({
  required SlaticoIconName name,
  Color? primaryColor,
  Color? secondaryColor,
}) {
  final String template = slaticoColorSvgTemplates[name]!;
  final String primaryHex = primaryColor != null
      ? formatColorToSvgHex(primaryColor)
      : '#FF6040';
  final String secondaryHex = secondaryColor != null
      ? formatColorToSvgHex(secondaryColor)
      : '#000000';

  return template
      .replaceAll('__SLATICO_PRIMARY_COLOR__', primaryHex)
      .replaceAll('__SLATICO_SECONDARY_COLOR__', secondaryHex);
}

/// Universal Flutter widget for rendering any of the 23 Slatico icons across all 7 styles:
///
/// - **Monochrome Styles (`thin`, `light`, `regular`, `bold`, `fill`):**
///   Rendered via Flutter's native [Icon] widget using bundled TTF fonts (`SlaticoIcons`).
/// - **Duotone (`SlaticoStyle.duotone`):**
///   Rendered via `flutter_svg` preserving independent primary [color], [secondaryColor],
///   and [secondaryOpacity] layers.
/// - **Color (`SlaticoStyle.color`):**
///   Rendered via `flutter_svg` (`SvgPicture.asset`) preserving all intrinsic multicolor
///   fills and gradients without destructive color filters.
class SlaticoIcon extends StatelessWidget {
  /// Creates a [SlaticoIcon] widget.
  const SlaticoIcon({
    super.key,
    required this.name,
    this.style,
    this.size,
    this.color,
    this.secondaryColor,
    this.secondaryOpacity,
    this.semanticLabel,
  });

  /// The Slatico icon family to render.
  final SlaticoIconName name;

  /// The visual style variant. Defaults to [SlaticoIconThemeData.style] or [SlaticoStyle.regular].
  final SlaticoStyle? style;

  /// Icon width and height in logical pixels. Defaults to [SlaticoIconThemeData.size],
  /// [IconThemeData.size], or `24.0`.
  final double? size;

  /// Primary foreground color for monochrome (`thin`, `light`, `regular`, `bold`, `fill`)
  /// and `duotone` styles. Ignored for `SlaticoStyle.color` so multicolor artwork is preserved.
  final Color? color;

  /// Secondary tone color for `SlaticoStyle.duotone`. Defaults to [color] when omitted.
  final Color? secondaryColor;

  /// Opacity (`0.0` to `1.0`) for the secondary layer in `SlaticoStyle.duotone`.
  /// Defaults to the icon's authored secondary opacity (typically `0.2` or `1.0`).
  final double? secondaryOpacity;

  /// Optional accessibility label announced by screen readers (TalkBack / VoiceOver).
  /// When `null`, the icon is treated as decorative (`excludeFromSemantics: true`).
  final String? semanticLabel;

  @override
  Widget build(BuildContext context) {
    final SlaticoIconThemeData? slaticoTheme =
        SlaticoIconTheme.maybeOf(context);
    final IconThemeData iconTheme = IconTheme.of(context);

    final SlaticoStyle resolvedStyle =
        style ?? slaticoTheme?.style ?? SlaticoStyle.regular;
    final double resolvedSize =
        size ?? slaticoTheme?.size ?? iconTheme.size ?? 24.0;

    // 1. Monochrome styles: use native Icon + bundled TTF IconData
    if (resolvedStyle.supportsIconData) {
      final Color? resolvedColor =
          color ?? slaticoTheme?.color ?? iconTheme.color;
      return Icon(
        SlaticoIcons.forIcon(name, resolvedStyle),
        size: resolvedSize,
        color: resolvedColor,
        semanticLabel: semanticLabel,
      );
    }

    // 2. Color style: render intrinsic multicolor SVG asset or custom two-color override
    if (resolvedStyle == SlaticoStyle.color) {
      final Color? customPrimary = color;
      final Color? customSecondary = secondaryColor;
      if (customPrimary != null || customSecondary != null) {
        final String colorMarkup = resolveColorSvgMarkup(
          name: name,
          primaryColor: customPrimary,
          secondaryColor: customSecondary,
        );
        return SvgPicture.string(
          colorMarkup,
          width: resolvedSize,
          height: resolvedSize,
          semanticsLabel: semanticLabel,
          excludeFromSemantics: semanticLabel == null,
        );
      }
      return SvgPicture.asset(
        name.colorAssetPath,
        package: SlaticoIcons.fontPackage,
        width: resolvedSize,
        height: resolvedSize,
        semanticsLabel: semanticLabel,
        excludeFromSemantics: semanticLabel == null,
      );
    }

    // 3. Duotone style: render two-tone / opacity-layered SVG via flutter_svg
    final Color primaryColor = color ??
        slaticoTheme?.color ??
        iconTheme.color ??
        const Color(0xFF09090B);
    final Color? resolvedSecondaryColor =
        secondaryColor ?? slaticoTheme?.secondaryColor;
    final double? resolvedSecondaryOpacity =
        secondaryOpacity ?? slaticoTheme?.secondaryOpacity;

    final String duotoneMarkup = resolveDuotoneSvgMarkup(
      name: name,
      primaryColor: primaryColor,
      secondaryColor: resolvedSecondaryColor,
      secondaryOpacity: resolvedSecondaryOpacity,
    );

    return SvgPicture.string(
      duotoneMarkup,
      width: resolvedSize,
      height: resolvedSize,
      semanticsLabel: semanticLabel,
      excludeFromSemantics: semanticLabel == null,
    );
  }
}
