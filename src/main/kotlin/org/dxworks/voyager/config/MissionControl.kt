package org.dxworks.voyager.config

import com.fasterxml.jackson.module.kotlin.readValue
import org.dxworks.voyager.config.global.GlobalConfig
import org.dxworks.voyager.instruments.Instrument
import org.dxworks.voyager.instruments.config.Command
import org.dxworks.voyager.instruments.config.InstrumentRunStrategy
import org.dxworks.voyager.utils.*
import java.io.File
import java.nio.file.Path
import kotlin.system.exitProcess

class MissionControl private constructor() {
    private val globalConfigFile = Path.of(globalConfigName).toFile()
    private val globalConfig: GlobalConfig = if (globalConfigFile.exists()) {
        yamlMapper.readValue(globalConfigFile)
    } else {
        GlobalConfig()
    }
    val target: File
        get() = Path.of(missionConfig.target).toFile()
    val instrumentsDir: File
        get() = (missionConfig.instrumentsDir ?: globalConfig.instrumentsDir)?.let { Path.of(it).toFile() }
            ?: defaultInstrumentsDir()

    private fun defaultInstrumentsDir() =
        missionHome.resolve(defaultInstrumentsLocation)

    private lateinit var missionHome: File
    private lateinit var missionConfig: MissionConfig

    companion object {
        private val log = logger<MissionControl>()
        private var singleton: MissionControl? = null
        fun get() = singleton ?: MissionControl().also { singleton = it }
    }

    fun setMissionSource(sourceFile: String) {
        val file = Path.of(sourceFile).toFile()
        if (file.exists()) {
            missionHome = file.absoluteFile.parentFile
            missionConfig = yamlMapper.readValue(file)
            log.info("Starting mission ${missionConfig.mission}")
        } else {
            log.error(
                """
                Could not load mission config from $sourceFile:
                The mission config file at $sourceFile does not exist or could not be read
                Please make sure this file exists or provide the path to a mission config file through
                the mission argument. IE -mission=/home/my-mission.yml
                """.trimMargin().trimIndent()
            )
            exitProcess(0)
        }
    }

    private fun getInstrumentFields(instrument: Instrument): MutableMap<String, String?> =
        missionConfig.instruments[instrument.name]?.parameters?.toMutableMap() ?: HashMap()

    fun processTemplate(
        instrument: Instrument,
        parameter: String,
        vararg additionalFields: Pair<String, String>
    ): String {
        val data = getInstrumentFieldsWithDefaults(instrument) + additionalFields
        var processedTemplate = parameter
        data.forEach { (k, v) -> processedTemplate = processedTemplate.replace("\${$k}", v ?: "null") }
        return processedTemplate
    }

    fun runOption(instrument: Instrument): InstrumentRunStrategy {
        return getInstrumentFields(instrument)[runFieldName]?.let(InstrumentRunStrategy.Companion::fromLabel)
            ?: instrument.configuration.run
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

    fun getMissionInstrumentsByThread(instruments: List<Instrument>): Map<Int, List<Instrument>> {
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
        }.groupBy { missionConfig.instruments[it.name]?.thread ?: defaultThreadId }
    }

    fun getProcessBuilder(vararg additionalEnvironment: Pair<String, String>) = ProcessBuilder().apply {
        val environment = environment()
        environment[pathEnv] =
            globalConfig.runtimes.values.joinToString(
                separator = pathEnvSeparator,
                postfix = pathEnvSeparator
            ) {
                Path.of(it).toAbsolutePath().toString()
            } + environment[pathEnv]

        globalConfig.environment.forEach { (k, v) -> environment[k] = v ?: "" }
        if (::missionConfig.isInitialized) {
            missionConfig.environment.forEach { (k, v) -> environment[k] = v ?: "" }
        }
        additionalEnvironment.forEach { environment[it.first] = it.second }
    }

    fun getThread(name: String): Int {
        return missionConfig.instruments[name]?.thread ?: defaultThreadId
    }
}
