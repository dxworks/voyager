package org.dxworks.voyager.runners.impl

import org.dxworks.voyager.config.Command
import org.dxworks.voyager.config.currentProjectFolder
import org.dxworks.voyager.runners.CommandExecutionResult
import org.dxworks.voyager.runners.ToolRunner
import org.dxworks.voyager.tools.Tool
import org.dxworks.voyager.utils.commandInterpreterName
import org.dxworks.voyager.utils.interpreterArg
import org.dxworks.voyager.utils.isUnix
import org.slf4j.LoggerFactory
import java.io.BufferedReader
import java.io.File
import java.io.InputStream

class CommandLineRunner(baseFolder: File) : ToolRunner(baseFolder) {

    private val processBuilder = ProcessBuilder()

    override fun internalRun(
        tool: Tool,
        baseFolder: File
    ): List<CommandExecutionResult> {

        val commands = if (isUnix) tool.configuration.commands.unix else tool.configuration.commands.win

        if (commands == null || commands.isEmpty()) {
            log.warn("${tool.name} does not have anything to run")
            return emptyList()
        }

        return commands.mapIndexed { index, command ->
            val identifier = getCommandIdentifier(command, tool, index)
            try {
                log.info("Running command $identifier")
                val process = getProcessForCommand(
                    tool.process({ command.exec }, currentProjectFolder to baseFolder.absolutePath),
                    baseFolder
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

    private fun setupLogger(identifier: String, process: Process) {
        val logger = LoggerFactory.getLogger(identifier)
        BufferedReader(process.inputStream.reader()).forEachLine { logger.info(it) }
    }

    private fun getCommandIdentifier(command: Command, tool: Tool, index: Int): String {
        val indexFromTool = "${index + 1} from ${tool.name}"
        return command.name?.let { "$it ($indexFromTool)" } ?: indexFromTool
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
