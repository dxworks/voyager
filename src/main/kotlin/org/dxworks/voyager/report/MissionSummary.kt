package org.dxworks.voyager.report

import org.dxworks.voyager.runners.CommandExecutionResult
import org.dxworks.voyager.runners.InstrumentExecutionResult
import org.dxworks.voyager.samples.FileAndAlias
import org.dxworks.voyager.utils.sumByLong
import java.time.Duration

data class MissionSummary(val instrumentResults: List<InstrumentExecutionResult>, val samples: List<FileAndAlias>) {
    override fun toString(): String {
        val sb = StringBuilder()
        sb.appendLine("------------------- Mission Summary -------------------")
        sb.appendLine()
        instrumentResults.forEach { instrumentResult ->
            sb.appendLine("-------- ${instrumentResult.instrument.name} --------")
            instrumentResult.results.forEach { (site, result) ->
                result.forEach {
                    sb.appendLine(getCommandSummary(it, site))
                }
            }
            sb.appendLine("Elapsed time: ${formatElapsedTime(instrumentResult.elapsedTime)}")
            sb.appendLine("------ end ${instrumentResult.instrument.name} ------")
        }
        sb.appendLine()
        sb.appendLine("____________________container____________________")
        samples.forEach {
            sb.appendLine(it.alias)
        }
        sb.appendLine("_________________________________________________")
        sb.appendLine()
        sb.appendLine("Elapsed time:${formatElapsedTime(instrumentResults.sumByLong { it.elapsedTime })}")
        sb.appendLine("----------------- end Mission Summary -----------------")
        return sb.toString()
    }

    private fun getCommandSummary(
        it: CommandExecutionResult,
        site: String
    ): String {

        return String.format(
            "%-12s %-40s %-7s [ %s ]",
            site,
            addDots(it.command.name, 40),
            it.errors?.let { "FAIL" } ?: "SUCCESS",
            formatElapsedTime(it.elapsedTime))
    }

    private fun addDots(it: String, length: Int): String {
        val sb = StringBuilder("$it ")
        while(sb.length < length){
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
