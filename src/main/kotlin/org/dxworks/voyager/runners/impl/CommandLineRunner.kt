package org.dxworks.voyager.runners.impl

import org.dxworks.voyager.config.Command
import org.dxworks.voyager.config.MissionControl
import org.dxworks.voyager.config.analysisFolder
import org.dxworks.voyager.instruments.Instrument
import org.dxworks.voyager.runners.CommandExecutionResult
import org.dxworks.voyager.runners.InstrumentRunner
import org.dxworks.voyager.utils.commandInterpreterName
import org.dxworks.voyager.utils.interpreterArg
import org.slf4j.LoggerFactory
import java.io.BufferedReader
import java.io.File
import java.io.InputStream
import java.nio.file.Path

class CommandLineRunner(baseFolder: File) : InstrumentRunner(baseFolder) {

    private val processBuilder = ProcessBuilder()

    override fun internalRun(
        instrument: Instrument,
        baseFolder: File
    ): List<CommandExecutionResult> {
        val commands = MissionControl.get().getCommands(instrument)
        if (commands == null || commands.isEmpty()) {
            log.warn("${instrument.name} does not have anything to run")
            return emptyList()
        }

        return commands.mapIndexed { index, command ->
            val identifier = getCommandIdentifier(command, instrument, index)
            val exec = command.exec
            if (exec == null) {
                CommandExecutionResult(command, "Nothing to run")
            } else {
                try {
                    log.info("Running command $identifier")
                    val process = getProcessForCommand(
                        instrument.process({ exec }, analysisFolder to baseFolder.absolutePath),
                        Path.of(command.dir?.let { dir -> instrument.process({ dir }) } ?: instrument.path).toFile()
                    )
                    setupLogger(identifier, process)
                    if (process.waitFor() == 0) {
                        log.info("Command $identifier completed")
                        CommandExecutionResult(command)
                    } else {
                        val errors = getLines(process.errorStream).joinToString("\n")
                        log.error("Command $identifier failed with errors:\n$errors")
                        CommandExecutionResult(command, errors)
                    }
                } catch (e: Exception) {
                    log.error("Command $identifier could not be run")
                    CommandExecutionResult(command, "Command could not be run:\n${e.message}")
                }
            }
        }
    }

    private fun setupLogger(identifier: String, process: Process) {
        val logger = LoggerFactory.getLogger(identifier)
        BufferedReader(process.inputStream.reader()).forEachLine { logger.info(it) }
    }

    private fun getCommandIdentifier(command: Command, instrument: Instrument, index: Int): String {
        val indexFromInstrument = "${index + 1} from ${instrument.name}"
        return command.name?.let { "$it ($indexFromInstrument)" } ?: indexFromInstrument
    }

    private fun getProcessForCommand(command: String, directory: File) =
        processBuilder.directory(directory).command(commandInterpreterName, interpreterArg, command).start()

    private fun getLines(inputStream: InputStream): List<String> {
        val reader = BufferedReader(inputStream.reader())
        val lines: MutableList<String> = ArrayList()
        reader.forEachLine { lines.add(it) }
        return lines
    }
}
