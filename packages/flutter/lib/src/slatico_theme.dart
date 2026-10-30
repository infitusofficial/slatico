import 'package:flutter/foundation.dart';
import 'package:flutter/widgets.dart';
import 'slatico_icon_data.dart';

/// Immutable configuration for default [SlaticoIcon] styling within a widget subtree.
@immutable
class SlaticoIconThemeData with Diagnosticable {
  /// Creates a [SlaticoIconThemeData].
  const SlaticoIconThemeData({
    this.style,
    this.size,
    this.color,
    this.secondaryColor,
    this.secondaryOpacity,
  });

  /// Default icon style when not explicitly provided to `SlaticoIcon`.
  final SlaticoStyle? style;

  /// Default icon size in logical pixels (falls back to `IconTheme.of(context).size ?? 24.0`).
  final double? size;

  /// Default primary color for monochrome and `duotone` icons.
  final Color? color;

  /// Default secondary tone color for `duotone` icons.
  final Color? secondaryColor;

  /// Default secondary layer opacity (`0.0` to `1.0`) for `duotone` icons.
  final double? secondaryOpacity;

  /// Creates a copy of this theme data with the given fields replaced.
  SlaticoIconThemeData copyWith({
    SlaticoStyle? style,
    double? size,
    Color? color,
    Color? secondaryColor,
    double? secondaryOpacity,
  }) {
    return SlaticoIconThemeData(
      style: style ?? this.style,
      size: size ?? this.size,
      color: color ?? this.color,
      secondaryColor: secondaryColor ?? this.secondaryColor,
      secondaryOpacity: secondaryOpacity ?? this.secondaryOpacity,
    );
  }

  /// Merges this theme data with [other].
  SlaticoIconThemeData merge(SlaticoIconThemeData? other) {
    if (other == null) {
      return this;
    }
    return copyWith(
      style: other.style,
      size: other.size,
      color: other.color,
      secondaryColor: other.secondaryColor,
      secondaryOpacity: other.secondaryOpacity,
    );
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) {
      return true;
    }
    return other is SlaticoIconThemeData &&
        other.style == style &&
        other.size == size &&
        other.color == color &&
        other.secondaryColor == secondaryColor &&
        other.secondaryOpacity == secondaryOpacity;
  }

  @override
  int get hashCode => Object.hash(
        style,
        size,
        color,
        secondaryColor,
        secondaryOpacity,
      );

  @override
  void debugFillProperties(DiagnosticPropertiesBuilder properties) {
    super.debugFillProperties(properties);
    properties
        .add(EnumProperty<SlaticoStyle>('style', style, defaultValue: null));
    properties.add(DoubleProperty('size', size, defaultValue: null));
    properties.add(ColorProperty('color', color, defaultValue: null));
    properties.add(
        ColorProperty('secondaryColor', secondaryColor, defaultValue: null));
    properties.add(
      DoubleProperty('secondaryOpacity', secondaryOpacity, defaultValue: null),
    );
  }
}

/// An [InheritedWidget] that defines default styling for [SlaticoIcon] widgets in its subtree.
class SlaticoIconTheme extends InheritedTheme {
  /// Creates a [SlaticoIconTheme] that provides [data] to all descendant [SlaticoIcon] widgets.
  const SlaticoIconTheme({
    super.key,
    required this.data,
    required super.child,
  });

  /// The configuration for descendant [SlaticoIcon] widgets.
  final SlaticoIconThemeData data;

  /// Returns the closest [SlaticoIconThemeData] ancestor, or `null` if none exists.
  static SlaticoIconThemeData? maybeOf(BuildContext context) {
    return context.dependOnInheritedWidgetOfExactType<SlaticoIconTheme>()?.data;
  }

  /// Returns the closest [SlaticoIconThemeData] ancestor, or an empty [SlaticoIconThemeData].
  static SlaticoIconThemeData of(BuildContext context) {
    return maybeOf(context) ?? const SlaticoIconThemeData();
  }

  @override
  bool updateShouldNotify(SlaticoIconTheme oldWidget) => data != oldWidget.data;

  @override
  Widget wrap(BuildContext context, Widget child) {
    return SlaticoIconTheme(data: data, child: child);
  }
}
