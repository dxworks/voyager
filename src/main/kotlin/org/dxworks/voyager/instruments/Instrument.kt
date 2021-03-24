package org.dxworks.voyager.instruments

import org.dxworks.voyager.config.MissionControl
import org.dxworks.voyager.instruments.config.Command
import org.dxworks.voyager.instruments.config.InstrumentConfiguration
import org.dxworks.voyager.results.FileAndAlias
import org.dxworks.voyager.results.InstrumentResult
import org.dxworks.voyager.results.execution.CommandExecutionResult
import org.dxworks.voyager.results.execution.InstrumentExecutionResult
import org.dxworks.voyager.utils.*
import org.slf4j.LoggerFactory
import java.io.File
import java.io.FileFilter
import java.io.InputStreamReader
import java.io.Reader
import java.nio.file.FileSystems
import java.nio.file.Path

data class Instrument(val path: String, val configuration: InstrumentConfiguration) {
    companion object {
        private val log = logger<Instrument>()
    }

    private val missionControl = MissionControl.get()
    val name = configuration.name


    private fun processTemplate(
        template: String,
        vararg additionalFields: Pair<String, String>
    ): String {
        return missionControl.processTemplate(this, template, *additionalFields, instrumentHome to path)
    }


    fun run(): InstrumentExecutionResult {
        val start = System.currentTimeMillis()
        val target = missionControl.target
        log.info("Started running $name")
        val results: MutableMap<String, List<CommandExecutionResult>> = HashMap()

        if (MissionControl.get().runsOnEach(this)) {
            target.listFiles(FileFilter { it.isDirectory })?.forEach { results[it.name] = internalRun(it) }
        } else {
            results[target.name] = internalRun(target)
        }

        log.info("Finished running $name")

        if (results.isEmpty()) {
            log.warn("No projects found for running $name")
        }

        return InstrumentExecutionResult(this, System.currentTimeMillis() - start)
            .also { it.results.putAll(results) }
    }

    private fun internalRun(repo: File): List<CommandExecutionResult> {
        val commands = MissionControl.get().getOrderedCommands(this)
        if (commands == null || commands.isEmpty()) {
            log.warn("$name does not have anything to run")
            return emptyList()
        }

        return commands.mapIndexed { index, command ->
            val identifier = getCommandIdentifier(command, index)
            val exec = command.exec
            if (exec == null) {
                CommandExecutionResult(command, 0, "Nothing to run")
            } else {
                val start = System.currentTimeMillis()
                try {
                    log.info("Running command $identifier")
                    val process = getProcessForCommand(command,
                        processTemplate(exec, repoFolder to repo.normalize().absolutePath, repoName to repo.name),
                        Path.of(command.dir?.let { dir ->
                            processTemplate(
                                dir,
                                repoFolder to repo.normalize().absolutePath, repoName to repo.name
                            )
                        } ?: path).toFile()
                    )
                    val errorsBuilder = setupLogger(identifier, process)
                    val processExitValue = process.waitFor()
                    val stop = System.currentTimeMillis()
                    if (processExitValue == 0) {
                        log.info("Command $identifier completed")
                        CommandExecutionResult(command, stop - start)
                    } else {
                        val errors = errorsBuilder.toString()
                        log.error("Command $identifier failed with errors:\n$errors")
                        CommandExecutionResult(command, stop - start, errors)
                    }
                } catch (e: Exception) {
                    log.error("Command $identifier could not be run:\n${e.message}")
                    CommandExecutionResult(
                        command,
                        System.currentTimeMillis() - start,
                        "Command could not be run:\n${e.message}"
                    )
                }
            }
        }
    }


    fun getResults(): InstrumentResult? {
        return configuration.results?.let { results ->
            InstrumentResult(this, results.flatMap { resultDir ->
                val dir = Path.of(processTemplate(resultDir.dir)).toFile()
                if (resultDir.files.isEmpty()) {
                    listOf(FileAndAlias(dir, Path.of(name, dir.name).toString()))
                } else {
                    val pathMatchers = resultDir.files.map { "glob:$it" }.map(FileSystems.getDefault()::getPathMatcher)
                    dir.walkTopDown().filter { file ->
                        pathMatchers.any { it.matches(dir.toPath().relativize(file.toPath())) }
                    }.map {
                        FileAndAlias(
                            it,
                            Path.of(name, dir.name, dir.toPath().relativize(it.toPath()).toString())
                                .toString()
                        )
                    }.toList()
                }
            })
        }
    }

    private fun setupLogger(identifier: String, process: Process): StringBuilder {
        val stringBuilder = StringBuilder()
        LoggerFactory.getLogger(identifier).apply {
            process.inputStream.reader().forEachLine { info(it) }
            process.errorStream.reader().forEachLine {
                info(it)
                stringBuilder.appendLine(it)
            }
        }
        return stringBuilder
    }

    private fun getCommandIdentifier(command: Command, index: Int) =
        "${command.name} (${index + 1} from $name)"

    private fun getProcessForCommand(command: Command, exec: String, directory: File) =
        missionControl.getProcessBuilder(this, command).directory(directory)
            .command(commandInterpreterName, interpreterArg, exec)
            .start()
}
