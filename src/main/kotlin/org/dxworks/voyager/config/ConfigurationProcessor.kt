package org.dxworks.voyager.config

import com.fasterxml.jackson.module.kotlin.readValue
import freemarker.template.Configuration
import freemarker.template.Template
import org.dxworks.voyager.instruments.Instrument
import java.io.StringWriter
import java.nio.file.Path

const val instrumentHome = "instrument"
const val analysisFolder = "site"

class ConfigurationProcessor private constructor() {
    private val fields: MutableMap<String, String> = HashMap()
    private val instrumentFields: MutableMap<String, MutableMap<String, String>> = HashMap()

    companion object {
        private var singleton: ConfigurationProcessor? = null
        fun get() = singleton ?: ConfigurationProcessor().also { singleton = it }
    }

    fun setConfigurationSource(sourceFile: String) {
        val file = Path.of(sourceFile).toFile()
        if (file.exists()) {
            instrumentFields.putAll(yamlMapper.readValue<Map<String, MutableMap<String, String>>>(file))
        }
    }

    fun addValue(key: String, value: String) {
        fields[key] = value
    }

    fun addValue(instrument: Instrument, key: String, value: String) {
        getInstrumentFields(instrument)[key] = value
    }

    private fun getInstrumentFields(instrument: Instrument) =
        instrumentFields.computeIfAbsent(instrument.name) { HashMap() }

    fun process(instrument: Instrument, template: String, vararg additionalFields: Pair<String, String>): String {
        return StringWriter().also {
            Template("", template, defaultConfiguration).process(
                fields + getInstrumentFieldsWithDefaults(instrument) + additionalFields, it
            )
        }.toString()
    }

    private fun getInstrumentFieldsWithDefaults(instrument: Instrument): Map<String, String> {
        return getInstrumentFields(instrument).apply {
            instrument.configuration.defaults.forEach { (k, v) ->
                putIfAbsent(
                    k,
                    v
                )
            }
        }
    }
}

private val defaultConfiguration = Configuration(Configuration.DEFAULT_INCOMPATIBLE_IMPROVEMENTS)
