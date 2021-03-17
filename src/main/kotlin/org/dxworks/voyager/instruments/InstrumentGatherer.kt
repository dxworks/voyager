package org.dxworks.voyager.instruments

import com.fasterxml.jackson.module.kotlin.readValue
import org.dxworks.voyager.config.executionConfigName
import org.dxworks.voyager.config.yamlMapper
import org.dxworks.voyager.utils.logger
import java.io.File
import java.io.FileFilter
import java.nio.file.Path

class InstrumentGatherer(baseFolder: String) {
    companion object {
        private val log = logger<InstrumentGatherer>()
    }

    val tools: List<Tool>

    init {
        tools =
            Path.of(baseFolder).toFile().listFiles(FileFilter { it.isToolBaseFolder() })?.mapNotNull { createTool(it) }
                ?: emptyList()
    }

    private fun createTool(it: File): Tool? {
        val absolutePath = it.absolutePath
        return try {
            Tool(absolutePath, yamlMapper.readValue(it.resolve(executionConfigName)))
        } catch (e: Exception) {
            log.error("Tool at $absolutePath could not be added", e)
            return null
        }

    }
}

private fun File.isToolBaseFolder(): Boolean {
    return list()?.contains(executionConfigName) ?: false
}
