package org.dxworks.voyager.instruments

import org.dxworks.voyager.api.instruments.config.Command
import org.dxworks.voyager.api.instruments.config.InstrumentConfiguration
import org.dxworks.voyager.api.instruments.config.InstrumentRunStrategy.*
import org.dxworks.voyager.api.utils.commandInterpreterName
import org.dxworks.voyager.api.utils.interpreterArg
import org.dxworks.voyager.mission.MissionControl
import org.dxworks.voyager.results.FileAndAlias
import org.dxworks.voyager.results.InstrumentResult
import org.dxworks.voyager.results.execution.CommandExecutionResult
import org.dxworks.voyager.results.execution.InstrumentExecutionResult
import org.dxworks.voyager.utils.instrumentHome
import org.dxworks.voyager.utils.logger
import org.dxworks.voyager.utils.repoFolder
import org.dxworks.voyager.utils.repoName
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
    private val thread: Int by lazy { missionControl.getThread(name) }

    private fun processTemplate(
        template: String,
        vararg additionalFields: Pair<String, String>
    ): String {
        return missionControl.processTemplate(this, template, *additionalFields, instrumentHome to path)
    }


    fun run(): InstrumentExecutionResult {
        val start = System.currentTimeMillis()
        val target = missionControl.target
        val results: MutableMap<String, List<CommandExecutionResult>> = HashMap()

        when (missionControl.runOption(this)) {
            ON_EACH -> {
                runAndLog {
                    target.listFiles(FileFilter { it.isDirectory })
                        ?.associate { it.name to internalRun(it, true) }
                }
            }
            ONCE -> {
                runAndLog { mapOf(target.name to internalRun(target)) }
            }
            NEVER -> {
                log.info("\n")
                log.info("thread $thread $name is deactivated")
                null
            }
        }?.let { results.putAll(it) }


        return InstrumentExecutionResult(this, System.currentTimeMillis() - start)
            .also { it.results.putAll(results) }
    }

    private fun runAndLog(
        runInstrument: () -> Map<String, List<CommandExecutionResult>>?,
    ): Map<String, List<CommandExecutionResult>>? {
        log.info("\n")
        log.info("thread $thread Started running $name")

        return runInstrument.invoke()?.also { results ->
            val status = if (results.any { (_, v) -> v.any { it.errors != null } })
                "WITH ERRORS"
            else
                "SUCCESSFULLY"

            log.info("Finished running $name $status")
        }
    }

    private fun internalRun(repo: File, printRepo: Boolean = false): List<CommandExecutionResult> {
        val commands = MissionControl.get().getOrderedCommands(this)
        if (commands.isEmpty()) {
            log.warn("thread $thread $name does not have anything to run")
            return emptyList()
        }

        return commands.mapIndexed { index, command ->
            val identifier = getCommandIdentifier(command, index)
            val exec = command.exec
            if (exec == null) {
                CommandExecutionResult(command, 0, "Nothing to run")
            } else {
                val start = System.currentTimeMillis()
                var instrumentLogger: InstrumentLogger? = null
                try {
                    if (printRepo) {
                        log.info("thread $thread Running command $identifier on ${repo.name}")
                    } else {
                        log.info("thread $thread Running command $identifier")
                    }
                    val process = getProcessForCommand(
                        command,
                        exec,
                        repo,
                        identifier
                    )
                    val (errorsBuilder, logger) = setupLogger(identifier, process)
                    instrumentLogger = logger
                    val processExitValue = process.waitFor()
                    val stop = System.currentTimeMillis()
                    if (processExitValue == 0) {
                        log.info("thread $thread Command $identifier completed")
                        CommandExecutionResult(command, stop - start)
                    } else {
                        val errors = errorsBuilder.toString()
                        log.error("thread $thread Command $identifier failed with errors:\n$errors")
                        CommandExecutionResult(command, stop - start, errors)
                    }
                } catch (e: Exception) {
                    log.error("thread $thread Command $identifier could not be run:\n${e.message}")
                    CommandExecutionResult(
                        command,
                        System.currentTimeMillis() - start,
                        "thread $thread Command could not be run:\n${e.message}"
                    )
                } finally {
                    instrumentLogger?.stop()
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

    private fun setupLogger(identifier: String, process: Process): Pair<StringBuilder, InstrumentLogger> {
        val stringBuilder = StringBuilder()
        val instrumentLogger = InstrumentLogger(configuration.name)
        LoggerFactory.getLogger(identifier).apply {
            thread {
                process.inputStream.reader().forEachLine {
                    info("thread $thread _${configuration.name}_ $it")
                    instrumentLogger.logger.info("thread $thread $it")
                }
            }
            thread {
                process.errorStream.reader().forEachLine {
                    info("thread $thread _${configuration.name}_ $it")
                    instrumentLogger.logger.info("thread $thread $it")
                    stringBuilder.appendLine("thread $thread _${configuration.name}_ $it")
                }
            }
        }
        return stringBuilder to instrumentLogger
    }

    private fun getCommandIdentifier(command: Command, index: Int) =
        "${command.name} (${index + 1} from $name)"

    private fun getProcessForCommand(command: Command, exec: String, repo: File, identifier: String): Process {
        val repoFolderField = repoFolder to repo.absoluteFile.normalize().absolutePath
        val repoNameField = repoName to repo.absoluteFile.normalize().name
        val commandEnv =
            command.environment.map { (k, v) -> k to processTemplate(v ?: "", repoFolderField, repoNameField) }.toMap()

        val instrumentEnv =
            configuration.environment.map { (k, v) -> k to processTemplate(v ?: "", repoFolderField, repoNameField) }
                .toMap()

        val processTemplate = processTemplate(exec, repoFolderField, repoNameField)
        val dir = Path.of(command.dir?.let { dir -> processTemplate(dir, repoFolderField, repoNameField) } ?: path)
            .toFile()
        log.info("thread $thread Running command $identifier: $processTemplate in ${dir.path}")

        return missionControl.getProcessBuilder(instrumentEnv, commandEnv)
            .directory(
                dir
            )
            .command(commandInterpreterName, interpreterArg, processTemplate)
            .start()
    }
}
