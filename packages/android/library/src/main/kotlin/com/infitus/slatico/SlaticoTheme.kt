package com.infitus.slatico

import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.Immutable
import androidx.compose.runtime.staticCompositionLocalOf
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp

/**
 * Ambient theme configuration for [SlaticoIcon] composables.
 */
@Immutable
data class SlaticoIconThemeData(
    val style: SlaticoStyle = SlaticoStyle.REGULAR,
    val size: Dp = 24.dp,
    val color: Color = Color.Unspecified,
    val secondaryColor: Color = Color.Unspecified,
    val secondaryAlpha: Float = 0.22f
)

/**
 * CompositionLocal providing default styling for descendant [SlaticoIcon] composables.
 */
val LocalSlaticoIconTheme = staticCompositionLocalOf { SlaticoIconThemeData() }

/**
 * Provides default [SlaticoIconThemeData] values to descendant [SlaticoIcon] composables.
 */
@Composable
fun SlaticoIconTheme(
    theme: SlaticoIconThemeData,
    content: @Composable () -> Unit
) {
    CompositionLocalProvider(LocalSlaticoIconTheme provides theme, content = content)
}
