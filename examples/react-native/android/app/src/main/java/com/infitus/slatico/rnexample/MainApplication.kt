package com.infitus.slatico.rnexample

import android.app.Application
import com.facebook.react.ReactPackage
import com.facebook.react.shell.MainReactPackage
import com.horcrux.svg.SvgPackage

class MainApplication : Application() {
    fun getRegisteredPackages(): List<ReactPackage> = listOf(
        MainReactPackage(),
        SvgPackage()
    )
}
