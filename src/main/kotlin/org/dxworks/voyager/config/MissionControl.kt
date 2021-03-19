package org.dxworks.voyager.config

import com.fasterxml.jackson.module.kotlin.readValue
import org.dxworks.voyager.instruments.Instrument
import org.dxworks.voyager.instruments.config.Command
import org.dxworks.voyager.instruments.config.InstrumentRunStrategy
import org.dxworks.voyager.utils.*
import java.io.File
import java.nio.file.Path
import kotlin.system.exitProcess

class MissionControl private constructor() {
    private val configFile = home.resolve(globalConfigName)
    private val globalConfig: GlobalConfig
    val target: File
        get() = Path.of(missionConfig.target).toFile()
    val instrumentsDir: File
        get() = Path.of(missionConfig.instrumentsDir ?: globalConfig.instrumentsDir ?: defaultInstrumentsLocation)
            .toFile()
    private lateinit var missionConfig: MissionConfig

    init {
        val defaultConfig = javaClass.getResourceAsStream("/$globalConfigName")
        if (!configFile.exists()) {
            configFile.writeBytes(defaultConfig.readAllBytes())
        }
        globalConfig = yamlMapper.readValue(configFile)
    }

    companion object {
        private val log = logger<MissionControl>()
        private var singleton: MissionControl? = null
        fun get() = singleton ?: MissionControl().also { singleton = it }
    }

    fun setContractSource(sourceFile: String) {
        val file = Path.of(sourceFile).toFile()
        if (file.exists()) {
            missionConfig = yamlMapper.readValue(file)
            log.info("Starting mission ${missionConfig.mission}")
        } else {
            log.error("Could not load mission config from $sourceFile")
            exitProcess(0)
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
        return (getInstrumentFields(instrument)[runFieldName]?.let(InstrumentRunStrategy.Companion::fromLabel)
            ?: instrument.configuration.run) == InstrumentRunStrategy.ON_EACH
    }

    private fun getInstrumentFieldsWithDefaults(instrument: Instrument): Map<String, String?> {
        return getInstrumentFields(instrument).apply {
            instrument.configuration.parameters.forEach { (k, v) -> putIfAbsent(k, v) }
            putIfAbsent(instrumentHome, instrument.path)
        }
    }

    fun getOrderedCommands(instrument: Instrument): List<Command>? {
        val commands = missionConfig.instruments[instrument.name]?.commands
        return if (globalConfig.runsAll || commands == null) {
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
        return if (globalConfig.runsAll) {
            instruments
        } else {
            val instrumentNameToInstrument =
                missionConfig.instruments.map { config -> config.key to instruments.find { it.name == config.key } }
            val (foundInstruments, notFoundInstruments) = instrumentNameToInstrument.partition { it.second != null }
            notFoundInstruments.forEach {
                log.warn("Could not find instrument ${it.first}")
            }
            foundInstruments.map { it.second!! }
        }
    }
}
