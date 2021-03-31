package org.dxworks.voyager

import org.apache.commons.io.FileUtils
import org.dxworks.voyager.config.MissionControl
import org.dxworks.voyager.doctor.versionDoctor
import org.dxworks.voyager.instruments.Instrument
import org.dxworks.voyager.instruments.InstrumentGatherer
import org.dxworks.voyager.report.MissionSummary
import org.dxworks.voyager.results.SampleContainer
import org.dxworks.voyager.utils.defaultContainerName
import org.dxworks.voyager.utils.defaultDoctorFile
import org.dxworks.voyager.utils.defaultMissionConfig
import org.dxworks.voyager.utils.doctorCommandArg
import org.slf4j.LoggerFactory
import java.io.FileFilter
import java.nio.file.FileSystems
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

    val reports = Path.of(".").toFile()
        .listFiles(FileFilter { FileSystems.getDefault().getPathMatcher("glob:**.log").matches(it.toPath()) })
        ?: emptyArray()

    val containerContent =
        SampleContainer(defaultContainerName).fill(instrumentResults, *reports)

    containerContent.map { it.file }
        .forEach {
            if (it.isDirectory)
                try {
                    FileUtils.cleanDirectory(it)
                } catch (e: Exception) {
                    log.error("Could not clean directory ${it.absolutePath} because ${e.message}")
                }
            else
                it.delete()
        }

    MissionSummary(results, containerContent, System.currentTimeMillis() - start).toString().split("\n")
        .forEach(log::info)
}
