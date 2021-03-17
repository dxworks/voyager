package org.dxworks.voyager.instruments

import org.dxworks.voyager.config.ConfigurationProcessor
import org.dxworks.voyager.config.InstrumentConfiguration
import org.dxworks.voyager.config.instrumentHome

open class Instrument(val path: String, val configuration: InstrumentConfiguration) {
    val name = configuration.name

    fun process(
        configFieldProvider: (InstrumentConfiguration) -> String,
        vararg additionalFields: Pair<String, String>
    ): String {
        return ConfigurationProcessor.get()
            .process(this, configFieldProvider.invoke(configuration), *additionalFields, instrumentHome to path)
    }
}
