package com.infitus.slatico

import androidx.annotation.DrawableRes
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.Image
import androidx.compose.foundation.layout.size
import androidx.compose.material3.Icon
import androidx.compose.material3.LocalContentColor
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.ColorFilter
import androidx.compose.ui.graphics.PathFillType
import androidx.compose.ui.graphics.drawscope.scale
import androidx.compose.ui.graphics.vector.PathParser
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.role
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.unit.Dp

/**
 * Unified Jetpack Compose icon component for Slatico supporting all 7 architectural styles:
 * - Monochrome styles ([SlaticoStyle.THIN], [SlaticoStyle.LIGHT], [SlaticoStyle.REGULAR],
 *   [SlaticoStyle.BOLD], [SlaticoStyle.FILL]) render via native `VectorDrawable` resources with tint.
 * - [SlaticoStyle.DUOTONE] renders either via its native `VectorDrawable` resource (when using a
 *   single primary color with built-in secondary alpha) or via dual-tone vector path composition when
 *   [secondaryColor] or custom [secondaryAlpha] is provided.
 * - [SlaticoStyle.COLOR] renders its intrinsic multi-tone palette without destructive tinting unless
 *   an explicit [color] override is supplied.
 */
@Composable
fun SlaticoIcon(
    name: SlaticoIconName,
    modifier: Modifier = Modifier,
    style: SlaticoStyle = LocalSlaticoIconTheme.current.style,
    size: Dp = LocalSlaticoIconTheme.current.size,
    color: Color = LocalSlaticoIconTheme.current.color,
    secondaryColor: Color = LocalSlaticoIconTheme.current.secondaryColor,
    secondaryAlpha: Float = LocalSlaticoIconTheme.current.secondaryAlpha,
    contentDescription: String? = null
) {
    val drawableRes = SlaticoDrawables.of(name, style)
    val sizedModifier = modifier.size(size)

    when (style) {
        SlaticoStyle.COLOR -> {
            val hasCustomColor = color != Color.Unspecified || secondaryColor != Color.Unspecified
            if (!hasCustomColor) {
                Image(
                    painter = painterResource(id = drawableRes),
                    contentDescription = contentDescription,
                    modifier = sizedModifier
                )
            } else {
                val resolvedPrimary = if (color != Color.Unspecified) {
                    color
                } else {
                    Color(0xFFFF6040)
                }
                val resolvedSecondary = if (secondaryColor != Color.Unspecified) {
                    secondaryColor
                } else {
                    Color(0xFF000000)
                }
                SlaticoCustomColorCanvas(
                    name = name,
                    primaryColor = resolvedPrimary,
                    secondaryColor = resolvedSecondary,
                    contentDescription = contentDescription,
                    modifier = sizedModifier
                )
            }
        }

        SlaticoStyle.DUOTONE -> {
            val resolvedPrimary = if (color != Color.Unspecified) {
                color
            } else {
                LocalContentColor.current
            }
            val hasCustomDuotone =
                secondaryColor != Color.Unspecified || kotlin.math.abs(secondaryAlpha - 0.22f) > 0.001f

            if (!hasCustomDuotone) {
                Icon(
                    painter = painterResource(id = drawableRes),
                    contentDescription = contentDescription,
                    tint = resolvedPrimary,
                    modifier = sizedModifier
                )
            } else {
                val resolvedSecondary = if (secondaryColor != Color.Unspecified) {
                    secondaryColor
                } else {
                    resolvedPrimary
                }
                SlaticoCustomDuotoneCanvas(
                    name = name,
                    primaryColor = resolvedPrimary,
                    secondaryColor = resolvedSecondary,
                    secondaryAlpha = secondaryAlpha.coerceIn(0f, 1f),
                    contentDescription = contentDescription,
                    modifier = sizedModifier
                )
            }
        }

        else -> {
            val resolvedTint = if (color != Color.Unspecified) {
                color
            } else {
                LocalContentColor.current
            }
            Icon(
                painter = painterResource(id = drawableRes),
                contentDescription = contentDescription,
                tint = resolvedTint,
                modifier = sizedModifier
            )
        }
    }
}

/**
 * Convenience overload accepting a direct `@DrawableRes` resource ID from [SlaticoDrawables].
 */
@Composable
fun SlaticoDrawableIcon(
    @DrawableRes drawableRes: Int,
    modifier: Modifier = Modifier,
    size: Dp = LocalSlaticoIconTheme.current.size,
    tint: Color = Color.Unspecified,
    preserveIntrinsicColors: Boolean = false,
    contentDescription: String? = null
) {
    val sizedModifier = modifier.size(size)
    if (preserveIntrinsicColors) {
        Image(
            painter = painterResource(id = drawableRes),
            contentDescription = contentDescription,
            colorFilter = if (tint != Color.Unspecified) ColorFilter.tint(tint) else null,
            modifier = sizedModifier
        )
    } else {
        val resolvedTint = if (tint != Color.Unspecified) tint else LocalContentColor.current
        Icon(
            painter = painterResource(id = drawableRes),
            contentDescription = contentDescription,
            tint = resolvedTint,
            modifier = sizedModifier
        )
    }
}

@Composable
private fun SlaticoCustomDuotoneCanvas(
    name: SlaticoIconName,
    primaryColor: Color,
    secondaryColor: Color,
    secondaryAlpha: Float,
    contentDescription: String?,
    modifier: Modifier = Modifier
) {
    val layers = remember(name) {
        SlaticoDuotoneVectors.layersFor(name).map { spec ->
            val composePath = PathParser().parsePathString(spec.pathData).toPath().apply {
                fillType = if (spec.evenOdd) PathFillType.EvenOdd else PathFillType.NonZero
            }
            Pair(composePath, spec)
        }
    }

    val a11yModifier = if (contentDescription != null) {
        modifier.semantics {
            this.contentDescription = contentDescription
            this.role = Role.Image
        }
    } else {
        modifier
    }

    Canvas(modifier = a11yModifier) {
        val scaleX = size.width / 24f
        val scaleY = size.height / 24f
        scale(scaleX = scaleX, scaleY = scaleY, pivot = androidx.compose.ui.geometry.Offset.Zero) {
            for ((composePath, spec) in layers) {
                val layerColor = if (spec.isSecondaryTone) secondaryColor else primaryColor
                val layerAlpha = if (spec.isSecondaryTone) secondaryAlpha else spec.defaultAlpha
                drawPath(
                    path = composePath,
                    color = layerColor,
                    alpha = layerAlpha
                )
            }
        }
    }
}

@Composable
private fun SlaticoCustomColorCanvas(
    name: SlaticoIconName,
    primaryColor: Color,
    secondaryColor: Color,
    contentDescription: String?,
    modifier: Modifier = Modifier
) {
    val layers = remember(name) {
        SlaticoColorVectors.layersFor(name).map { spec ->
            val composePath = PathParser().parsePathString(spec.pathData).toPath().apply {
                fillType = if (spec.evenOdd) PathFillType.EvenOdd else PathFillType.NonZero
            }
            Pair(composePath, spec)
        }
    }

    val a11yModifier = if (contentDescription != null) {
        modifier.semantics {
            this.contentDescription = contentDescription
            this.role = Role.Image
        }
    } else {
        modifier
    }

    Canvas(modifier = a11yModifier) {
        val scaleX = size.width / 24f
        val scaleY = size.height / 24f
        scale(scaleX = scaleX, scaleY = scaleY, pivot = androidx.compose.ui.geometry.Offset.Zero) {
            for ((composePath, spec) in layers) {
                val layerColor = if (spec.isSecondaryTone) secondaryColor else primaryColor
                drawPath(
                    path = composePath,
                    color = layerColor,
                    alpha = spec.defaultAlpha
                )
            }
        }
    }
}
