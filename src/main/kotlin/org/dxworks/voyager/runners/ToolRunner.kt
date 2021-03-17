package org.dxworks.voyager.runners

import org.dxworks.voyager.config.InstrumentConfiguration
import org.dxworks.voyager.instruments.Instrument
import org.dxworks.voyager.utils.logger
import java.io.File
import java.io.FileFilter


abstract class ToolRunner(private val baseFolder: File) {
    companion object {
        val log = logger<ToolRunner>()
    }

    fun run(instrument: Instrument): ToolExecutionResult {
        log.info("Started running ${instrument.name}")
        val toolExecutionResult = ToolExecutionResult(instrument)
        if (instrument.process(InstrumentConfiguration::onEach) == "true") {
            baseFolder.listFiles(FileFilter { it.isDirectory })?.forEach {
                toolExecutionResult.results[it.name] = internalRun(instrument, it)
            }
        } else {
            toolExecutionResult.results[baseFolder.name] = internalRun(instrument, baseFolder)
        }
        log.info("Finished running ${instrument.name}")
        if (toolExecutionResult.results.isEmpty()) {
            log.warn("No projects found for running ${instrument.name}")
        }
        return toolExecutionResult
    }

    protected abstract fun internalRun(instrument: Instrument, baseFolder: File): List<CommandExecutionResult>
}
