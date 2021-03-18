package org.dxworks.voyager.runners

import org.dxworks.voyager.config.MissionControl
import org.dxworks.voyager.instruments.Instrument
import org.dxworks.voyager.utils.logger
import java.io.File
import java.io.FileFilter


abstract class InstrumentRunner(private val baseFolder: File) {
    companion object {
        val log = logger<InstrumentRunner>()
    }

    fun run(instrument: Instrument): InstrumentExecutionResult {
        val start = System.currentTimeMillis()
        log.info("Started running ${instrument.name}")
        val results: MutableMap<String, List<CommandExecutionResult>> = HashMap()
        if (MissionControl.get().runsOnEach(instrument)) {
            baseFolder.listFiles(FileFilter { it.isDirectory })?.forEach {

                results[it.name] = internalRun(instrument, it)
            }
        } else {
            results[baseFolder.name] = internalRun(instrument, baseFolder)
        }
        log.info("Finished running ${instrument.name}")
        if (results.isEmpty()) {
            log.warn("No projects found for running ${instrument.name}")
        }
        return InstrumentExecutionResult(instrument, System.currentTimeMillis() - start)
            .also { it.results.putAll(results)
        }
    }

    protected abstract fun internalRun(instrument: Instrument, baseFolder: File): List<CommandExecutionResult>
}
