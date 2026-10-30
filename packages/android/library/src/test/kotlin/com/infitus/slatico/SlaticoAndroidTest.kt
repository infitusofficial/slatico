package com.infitus.slatico

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Test

class SlaticoAndroidTest {
    @Test
    fun hasExactly23IconFamiliesAnd7Styles() {
        assertEquals(23, SlaticoIconName.entries.size)
        assertEquals(7, SlaticoStyle.entries.size)
        assertEquals(161, SlaticoDrawables.TOTAL_VARIANTS)
    }

    @Test
    fun resolvesAll161DrawableResourceIds() {
        val seenIds = mutableSetOf<Int>()
        for (icon in SlaticoIconName.entries) {
            for (style in SlaticoStyle.entries) {
                val resId = SlaticoDrawables.of(icon, style)
                assertTrue("Resource ID should be non-zero for ${icon.kebabName}/${style.id}", resId != 0)
                seenIds.add(resId)
            }
        }
        assertEquals(161, seenIds.size)
    }

    @Test
    fun resolvesIconsByKebabSlugAndStyle() {
        assertEquals(SlaticoIconName.HOUSE, SlaticoIconName.fromKebabName("house"))
        assertEquals(SlaticoIconName.TREND_UP, SlaticoIconName.fromKebabName("trend-up"))
        assertEquals(SlaticoIconName.SHIELD_CHECK, SlaticoIconName.fromKebabName("shield-check"))

        val houseRegular = SlaticoDrawables.fromKebabName("house", SlaticoStyle.REGULAR)
        assertNotNull(houseRegular)
        assertEquals(SlaticoDrawables.houseRegular, houseRegular)
    }

    @Test
    fun duotoneVectorSpecsHaveValidLayersForAll23Icons() {
        val openStrokeIcons = setOf("minus", "plus")
        for (icon in SlaticoIconName.entries) {
            val layers = SlaticoDuotoneVectors.layersFor(icon)
            assertTrue("Expected at least 1 layer for ${icon.kebabName}", layers.isNotEmpty())
            assertTrue(
                "Expected at least one primary tone layer for ${icon.kebabName}",
                layers.any { !it.isSecondaryTone }
            )
            if (icon.kebabName !in openStrokeIcons) {
                assertTrue(
                    "Expected at least one secondary tone layer for ${icon.kebabName}",
                    layers.any { it.isSecondaryTone }
                )
            }
        }
    }

    @Test
    fun excludesDemoIconsFromCatalog() {
        val slugs = SlaticoIconName.entries.map { it.kebabName }.toSet()
        assertFalse(slugs.contains("cube"))
        assertFalse(slugs.contains("heart"))
        assertFalse(slugs.contains("sparkles"))
    }
}
