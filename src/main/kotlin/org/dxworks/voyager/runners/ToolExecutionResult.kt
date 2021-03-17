package org.dxworks.voyager.runners

import org.dxworks.voyager.instruments.Tool

class ToolExecutionResult(val tool: Tool) {
    val results = LinkedHashMap<String, List<CommandExecutionResult>>()
    fun hasErrors() = results.values.any { resultList -> resultList.any { it.errors != null } }
}
