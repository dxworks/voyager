package org.dxworks.voyager.report

import org.dxworks.voyager.results.FileAndAlias
import org.dxworks.voyager.results.execution.CommandExecutionResult
import org.dxworks.voyager.results.execution.InstrumentExecutionResult
import java.time.Duration
import kotlin.math.max

data class MissionSummary(
    val instrumentResults: List<InstrumentExecutionResult>,
    val results: List<FileAndAlias>,
    val elapsedTime: Long
) {
    override fun toString(): String {
        val sb = StringBuilder()
        sb.appendLine("------------------- Mission Summary -------------------")
        sb.appendLine()
        instrumentResults.forEach { instrumentResult ->
            sb.appendLine("-------- ${instrumentResult.instrument.name} --------")
            val maxRepoLength = instrumentResult.results.maxOfOrNull { (k, _) -> k.length } ?: 0
            instrumentResult.results.forEach { (repo, result) ->
                if (result.isEmpty())
                    sb.appendLine("Nothing was run")
                else {
                    val maxCommandName = result.maxOfOrNull { c -> c.command.name.length } ?: 0
                    result.forEach {
                        sb.appendLine(getCommandSummary(it, maxCommandName, repo, maxRepoLength))
                    }
                }
            }
            sb.appendLine()
            sb.appendLine("Elapsed time: ${formatElapsedTime(instrumentResult.elapsedTime)}")
            sb.appendLine("------ end ${instrumentResult.instrument.name} ------")
        }
        sb.appendLine()
        sb.appendLine("_______________________container_______________________")
        sb.appendLine()
        results.forEach {
            sb.appendLine(it.alias)
        }
        sb.appendLine("_______________________________________________________")
        sb.appendLine()
        sb.appendLine("Elapsed time: ${formatElapsedTime(elapsedTime)}")
        sb.appendLine("----------------- end Mission Summary -----------------")
        return sb.toString()
    }

    private fun getCommandSummary(
        commandExecutionResult: CommandExecutionResult,
        maxCommandName: Int,
        repo: String,
        maxRepoLength: Int
    ): String {

        return String.format(
            "%-${maxRepoLength}s %-40s %-7s [ %s ]",
            repo,
            addDots(commandExecutionResult.command.name, max(40, maxCommandName + 5)),
            commandExecutionResult.errors?.let { "FAIL" } ?: "SUCCESS",
            formatElapsedTime(commandExecutionResult.elapsedTime))
    }

    private fun addDots(it: String, length: Int): String {
        val sb = StringBuilder("$it ")
        while (sb.length < length) {
            sb.append('.')
        }
        return sb.toString()
    }

    private fun formatElapsedTime(millis: Long): String {
        val duration = Duration.ofMillis(millis)
        val sb = StringBuilder()
        val days = duration.toDaysPart()
        val hours = duration.toHoursPart()
        val minutes = duration.toMinutesPart()
        if (days > 0)
            sb.append("$days d ")
        if (hours > 0)
            sb.append("$hours h ")
        if (minutes > 0)
            sb.append("$minutes m ")
        sb.append("${duration.toSecondsPart()}.${duration.toMillis()} s")
        return sb.toString()
    }
}
