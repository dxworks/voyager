package org.dxworks.voyager.config

import com.fasterxml.jackson.module.kotlin.readValue
import org.dxworks.voyager.instruments.Instrument
import java.nio.file.Path

const val instrumentHome = "instrument"
const val analysisFolder = "site"

class ConfigurationProcessor private constructor() {
    private val fields: MutableMap<String, String> = HashMap()
    private var voyagerConfig: VoyagerConfig = VoyagerConfig()

    companion object {
        private var singleton: ConfigurationProcessor? = null
        fun get() = singleton ?: ConfigurationProcessor().also { singleton = it }
    }

    fun setConfigurationSource(sourceFile: String) {
        val file = Path.of(sourceFile).toFile()
        if (file.exists()) {
            voyagerConfig = yamlMapper.readValue(file)
        }
    }

    fun getInstrumentFields(instrument: Instrument): MutableMap<String, String?> =
        voyagerConfig.instruments[instrument.name]?.toMutableMap() ?: HashMap()

    fun process(instrument: Instrument, template: String, vararg additionalFields: Pair<String, String>): String {
        val data = fields + getInstrumentFieldsWithDefaults(instrument) + additionalFields
        var processedTemplate = template
        data.forEach { (k, v) -> processedTemplate = processedTemplate.replace("\${$k}", v ?: "null") }
        return processedTemplate
    }


    private fun getInstrumentFieldsWithDefaults(instrument: Instrument): Map<String, String?> {
        return getInstrumentFields(instrument).apply {
            instrument.configuration.parameters.forEach { (k, v) -> putIfAbsent(k, v) }
        }
    }
}
