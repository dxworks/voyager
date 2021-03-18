package org.dxworks.voyager.runners

import org.dxworks.voyager.instruments.Instrument
import org.dxworks.voyager.utils.sumByLong

class InstrumentExecutionResult(val instrument: Instrument) {
    val results = LinkedHashMap<String, List<CommandExecutionResult>>()
    val elapsedTime: Long = results.values.sumByLong { it.sumByLong(CommandExecutionResult::elapsedTime) }
    fun hasErrors() = results.values.any { resultList -> resultList.any { it.errors != null } }
}
