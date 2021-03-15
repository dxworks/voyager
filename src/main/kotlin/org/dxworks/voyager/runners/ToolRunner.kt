package org.dxworks.voyager.runners

import org.dxworks.voyager.tools.Tool
import org.dxworks.voyager.utils.logger
import java.io.File
import java.io.FileFilter


abstract class ToolRunner(private val baseFolder: File) {
    companion object {
        val log = logger<ToolRunner>()
    }

    fun run(tool: Tool, templateFields: Map<String, String>): ToolExecutionResult {
        log.info("Started running ${tool.name}")
        val toolExecutionResult = ToolExecutionResult(tool)
        baseFolder.listFiles(FileFilter { it.isDirectory })?.forEach {
            toolExecutionResult.results[it.name] = internalRun(tool, it,templateFields)
        }
        log.info("Finished running ${tool.name}")
        if (toolExecutionResult.results.isEmpty()) {
            log.warn("No projects found for running ${tool.name}")
        }
        return toolExecutionResult
    }

    protected abstract fun internalRun(tool: Tool, projectFolder: File, templateFields: Map<String, String>): List<CommandExecutionResult>
}
