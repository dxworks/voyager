package org.dxworks.voyager.runners

import org.dxworks.voyager.config.InstrumentConfiguration
import org.dxworks.voyager.instruments.Instrument
import org.dxworks.voyager.utils.logger
import java.io.File
import java.io.FileFilter


abstract class InstrumentRunner(private val baseFolder: File) {
    companion object {
        val log = logger<InstrumentRunner>()
    }

    fun run(instrument: Instrument): InstrumentExecutionResult {
        log.info("Started running ${instrument.name}")
        val instrumentExecutionResult = InstrumentExecutionResult(instrument)
        if (instrument.process(InstrumentConfiguration::onEach) == "true") {
            baseFolder.listFiles(FileFilter { it.isDirectory })?.forEach {
                instrumentExecutionResult.results[it.name] = internalRun(instrument, it)
            }
        } else {
            instrumentExecutionResult.results[baseFolder.name] = internalRun(instrument, baseFolder)
        }
        log.info("Finished running ${instrument.name}")
        if (instrumentExecutionResult.results.isEmpty()) {
            log.warn("No projects found for running ${instrument.name}")
        }
        return instrumentExecutionResult
    }

    protected abstract fun internalRun(instrument: Instrument, baseFolder: File): List<CommandExecutionResult>
}
