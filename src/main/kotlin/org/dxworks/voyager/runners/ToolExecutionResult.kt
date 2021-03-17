package org.dxworks.voyager.runners

import org.dxworks.voyager.instruments.Instrument

class ToolExecutionResult(val instrument: Instrument) {
    val results = LinkedHashMap<String, List<CommandExecutionResult>>()
    fun hasErrors() = results.values.any { resultList -> resultList.any { it.errors != null } }
}
