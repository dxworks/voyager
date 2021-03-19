package org.dxworks.voyager

import org.dxworks.argumenthor.Argumenthor
import org.dxworks.argumenthor.config.ArgumenthorConfiguration
import org.dxworks.argumenthor.config.fields.impl.StringField
import org.dxworks.argumenthor.config.sources.impl.ArgsSource
import org.dxworks.voyager.config.MissionControl
import org.dxworks.voyager.instruments.Instrument
import org.dxworks.voyager.instruments.InstrumentGatherer
import org.dxworks.voyager.report.MissionSummary
import org.dxworks.voyager.results.SampleContainer
import org.dxworks.voyager.utils.*
import org.slf4j.LoggerFactory
import java.nio.file.Path
import kotlin.system.exitProcess

private val log = LoggerFactory.getLogger("Main")

fun main(args: Array<String>) {
    val start = System.currentTimeMillis()
    val argumenthor = getArgumenthor(args)
    MissionControl.get().setContractSource(argumenthor.getValue(mission)!!)

    val instruments = prepareInstruments(argumenthor)

    val results = instruments.map(Instrument::run)

    val instrumentResults = results.mapNotNull { it.instrument.getResults() }

    log.info(if (instrumentResults.isEmpty()) "Nothing to package" else "Packaging results")

    val containerContent =
        SampleContainer(defaultContainerName).fill(instrumentResults, Path.of(missionReport).toFile())

    MissionSummary(results, containerContent, System.currentTimeMillis() - start).toString().split("\n")
        .forEach(log::info)
}

private fun prepareInstruments(argumenthor: Argumenthor): List<Instrument> {
    val instrumentsLocation = getArg(argumenthor, instruments)
    val instrumentGatherer = if (instrumentsLocation != null) InstrumentGatherer(instrumentsLocation) else {
        log.error("Could not read instruments location")
        exitProcess(1)
    }
    val repo = getArg(argumenthor, target)
    if (repo == null) {
        log.error("Could not read base folder")
        exitProcess(1)
    }
    val instruments = instrumentGatherer.instruments
    if (instruments.isEmpty()) {
        log.warn("No instruments found at ${instrumentsLocation}, nothing to run")
        exitProcess(1)
    }

    return MissionControl.get().getMissionInstruments(instruments)
}

private fun getArg(argumenthor: Argumenthor, arg: String) =
    argumenthor.getValue<String>(arg)?.trim('\"', '\'')


private fun getArgumenthor(args: Array<String>) = Argumenthor(ArgumenthorConfiguration(
    StringField(target, System.getProperty("user.home") + "/repos"),
    StringField(instruments, "."),
    StringField(mission, defaultMissionConfig)
).apply {
    addSource(ArgsSource().also { it.argsList = args.toList() })
})
