package org.dxworks.voyager.instruments

import org.dxworks.voyager.config.MissionControl
import org.dxworks.voyager.instruments.config.Command
import org.dxworks.voyager.instruments.config.InstrumentConfiguration
import org.dxworks.voyager.instruments.config.InstrumentRunStrategy.*
import org.dxworks.voyager.results.FileAndAlias
import org.dxworks.voyager.results.InstrumentResult
import org.dxworks.voyager.results.execution.CommandExecutionResult
import org.dxworks.voyager.results.execution.InstrumentExecutionResult
import org.dxworks.voyager.utils.*
import org.slf4j.LoggerFactory
import java.io.File
import java.io.FileFilter
import java.nio.file.FileSystems
import java.nio.file.Path
import kotlin.concurrent.thread

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

        when (MissionControl.get().runOption(this)) {
            ON_EACH -> target.listFiles(FileFilter { it.isDirectory })?.forEach { results[it.name] = internalRun(it) }
            ONCE -> results[target.name] = internalRun(target)
            NEVER -> log.info("$name is deactivated")
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
                    val process = getProcessForCommand(
                        command,
                        exec,
                        repo
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
            thread {
                process.inputStream.reader().forEachLine { info(it) }
            }
            thread {
                process.errorStream.reader().forEachLine {
                    info(it)
                    stringBuilder.appendLine(it)
                }
            }
        }
        return stringBuilder
    }

    private fun getCommandIdentifier(command: Command, index: Int) =
        "${command.name} (${index + 1} from $name)"

    private fun getProcessForCommand(command: Command, exec: String, repo: File): Process {
        val repoFolderField = repoFolder to repo.absoluteFile.normalize().absolutePath
        val repoNameField = repoName to repo.absoluteFile.normalize().name
        val environment =
            command.environment.map { (k, v) -> k to processTemplate(v ?: "", repoFolderField, repoNameField) }
                .toMap()
                .toMutableMap()
        configuration.environment.forEach { (k, v) ->
            environment.putIfAbsent(k, processTemplate(v ?: "", repoFolderField, repoNameField))
        }

        return missionControl.getProcessBuilder(*environment.toList().toTypedArray())
            .directory(
                Path.of(command.dir?.let { dir -> processTemplate(dir, repoFolderField, repoNameField) } ?: path)
                    .toFile()
            )
            .command(commandInterpreterName, interpreterArg, processTemplate(exec, repoFolderField, repoNameField))
            .start()
    }
}
