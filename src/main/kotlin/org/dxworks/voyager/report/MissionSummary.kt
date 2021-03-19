package org.dxworks.voyager.report

import org.dxworks.voyager.results.execution.CommandExecutionResult
import org.dxworks.voyager.results.execution.InstrumentExecutionResult
import org.dxworks.voyager.results.FileAndAlias
import java.time.Duration

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
            instrumentResult.results.forEach { (repo, result) ->
                result.forEach {
                    sb.appendLine(getCommandSummary(it, repo))
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
        sb.appendLine("Elapsed time:${formatElapsedTime(elapsedTime)}")
        sb.appendLine("----------------- end Mission Summary -----------------")
        return sb.toString()
    }

    private fun getCommandSummary(
        it: CommandExecutionResult,
        repo: String
    ): String {

        return String.format(
            "%-12s %-40s %-7s [ %s ]",
            repo,
            addDots(it.command.name, 40),
            it.errors?.let { "FAIL" } ?: "SUCCESS",
            formatElapsedTime(it.elapsedTime))
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
