package com.infitus.slatico.rnexample

import com.facebook.react.ReactPackage
import com.horcrux.svg.SvgPackage
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Test

class ReactNativeSvgLinkTest {
    @Test
    fun `SvgPackage links and implements ReactPackage`() {
        val pkg: ReactPackage = SvgPackage()
        assertNotNull(pkg)
        assertTrue(pkg is SvgPackage)
    }

    @Test
    fun `MainApplication registers MainReactPackage and SvgPackage`() {
        val app = MainApplication()
        val packages = app.getRegisteredPackages()
        assertTrue(packages.any { it is SvgPackage })
    }
}
