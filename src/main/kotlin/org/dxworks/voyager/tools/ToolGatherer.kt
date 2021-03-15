package org.dxworks.voyager.tools

import com.fasterxml.jackson.module.kotlin.readValue
import org.dxworks.voyager.config.executionConfigName
import org.dxworks.voyager.config.yamlMapper
import java.io.File
import java.io.FileFilter
import java.nio.file.Paths

class ToolGatherer(baseFolder: String) {
    val tools: List<Tool>

    init {
        tools = Paths.get(baseFolder).toFile().listFiles(FileFilter { it.isToolBaseFolder() })?.map { createTool(it) }
                ?: emptyList()
    }

    private fun createTool(it: File): Tool {
        return Tool(it.absolutePath, yamlMapper.readValue(it.resolve(executionConfigName)))
    }
}

private fun File.isToolBaseFolder(): Boolean {
    return list()?.contains(executionConfigName) ?: false
}
