package org.dxworks.voyager

import org.dxworks.voyager.config.MissionControl
import org.dxworks.voyager.doctor.versionDoctor
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
    if (args.isNotEmpty())
        if (args[0] == doctorCommandArg) {
            versionDoctor(
                if (args.size == 2) args[1] else defaultDoctorFile
            )
            return
        }

    val missionControl = MissionControl.get()
    if (args.size == 1) {
        missionControl.setMissionSource(args[0])
    } else if (args.isEmpty()) {
        missionControl.setMissionSource(defaultMissionConfig)
    }

    val start = System.currentTimeMillis()

    val instrumentsDir = missionControl.instrumentsDir

    val instruments = missionControl.getMissionInstruments(InstrumentGatherer(instrumentsDir).instruments)

    if (instruments.isEmpty()) {
        log.warn("No instruments found at ${instrumentsDir}, nothing to run")
        exitProcess(1)
    }

    val results = instruments.map(Instrument::run).filterNot { it.isEmpty() }

    val instrumentResults = results.mapNotNull { it.instrument.getResults() }

    log.info(if (instrumentResults.isEmpty()) "Nothing to package" else "Packaging results")

    val containerContent =
        SampleContainer(defaultContainerName).fill(instrumentResults, Path.of(missionReport).toFile())

    MissionSummary(results, containerContent, System.currentTimeMillis() - start).toString().split("\n")
        .forEach(log::info)
}
