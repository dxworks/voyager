package org.dxworks.voyager.config

import com.fasterxml.jackson.module.kotlin.readValue
import org.dxworks.voyager.instruments.Instrument
import org.dxworks.voyager.utils.logger
import org.dxworks.voyager.utils.yamlMapper
import java.nio.file.Path

const val instrumentHome = "instrument"
const val analysisFolder = "site"

class MissionControl private constructor() {
    private lateinit var missionConfig: MissionConfig

    companion object {
        private val log = logger<MissionControl>()
        private var singleton: MissionControl? = null
        fun get() = singleton ?: MissionControl().also { singleton = it }
    }

    fun setContractSource(sourceFile: String) {
        val file = Path.of(sourceFile).toFile()
        if (file.exists()) {
            missionConfig = yamlMapper.readValue(file)
        }
    }

    private fun getInstrumentFields(instrument: Instrument): MutableMap<String, String?> =
        missionConfig.instruments[instrument.name]?.parameters?.toMutableMap() ?: HashMap()

    fun process(instrument: Instrument, parameter: String, vararg additionalFields: Pair<String, String>): String {
        val data = getInstrumentFieldsWithDefaults(instrument) + additionalFields
        var processedTemplate = parameter
        data.forEach { (k, v) -> processedTemplate = processedTemplate.replace("\${$k}", v ?: "null") }
        return processedTemplate
    }

    fun runsOnEach(instrument: Instrument): Boolean {
        return getInstrumentFields(instrument)["onEach"]?.let { it.toBoolean() }
            ?: instrument.configuration.onEach
    }

    private fun getInstrumentFieldsWithDefaults(instrument: Instrument): Map<String, String?> {
        return getInstrumentFields(instrument).apply {
            instrument.configuration.parameters.forEach { (k, v) -> putIfAbsent(k, v) }
        }
    }

    fun getCommands(instrument: Instrument): List<Command>? {
        val commands = missionConfig.instruments[instrument.name]?.commands
        return if (commands == null) {
            instrument.configuration.commands
        } else {
            val commandNameToCommand =
                commands.map { name -> name to instrument.configuration.commands?.find { it.name == name } }
            val (foundCommands, notFoundCommands) = commandNameToCommand.partition { it.second != null }
            notFoundCommands.forEach {
                log.warn("Could not find command ${it.first} for ${instrument.name}")
            }
            foundCommands.map { it.second!! }
        }
    }

    fun getMissionInstruments(instruments: List<Instrument>): List<Instrument> {
        val instrumentNameToInstrument =
            missionConfig.instruments.map { config -> config.key to instruments.find { it.name == config.key } }
        val (foundInstruments, notFoundInstruments) = instrumentNameToInstrument.partition { it.second != null }
        notFoundInstruments.forEach {
            log.warn("Could not find instrument ${it.first}")
        }
        return foundInstruments.map { it.second!! }
    }
}
