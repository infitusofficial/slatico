package com.infitus.slatico

/**
 * The seven official architectural visual styles supported across all Slatico icon families.
 */
enum class SlaticoStyle(
    val id: String,
    val label: String,
    val isMonochrome: Boolean
) {
    /** 1px optical stroke weight. */
    THIN(id = "thin", label = "Thin", isMonochrome = true),

    /** 1.5px optical stroke weight. */
    LIGHT(id = "light", label = "Light", isMonochrome = true),

    /** 2px balanced default stroke weight. */
    REGULAR(id = "regular", label = "Regular", isMonochrome = true),

    /** 3px high-emphasis stroke weight. */
    BOLD(id = "bold", label = "Bold", isMonochrome = true),

    /** Solid geometric silhouette with negative-space cutouts. */
    FILL(id = "fill", label = "Fill", isMonochrome = true),

    /** Layered primary structure paired with a translucent secondary tone. */
    DUOTONE(id = "duotone", label = "Duotone", isMonochrome = false),

    /** Multi-tone semantic vector artwork. */
    COLOR(id = "color", label = "Color", isMonochrome = false);

    companion object {
        private val BY_ID: Map<String, SlaticoStyle> = entries.associateBy { it.id }

        /**
         * Resolves a [SlaticoStyle] by its lowercase identifier (e.g. `"regular"`, `"duotone"`).
         */
        @JvmStatic
        fun fromId(id: String): SlaticoStyle? = BY_ID[id.lowercase()]
    }
}
