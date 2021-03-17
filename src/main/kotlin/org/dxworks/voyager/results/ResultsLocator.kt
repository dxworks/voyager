package org.dxworks.voyager.results

import org.dxworks.voyager.instruments.Tool
import java.io.File
import java.nio.file.FileSystems
import java.nio.file.Path

class ResultsLocator() {
    fun locate(tool: Tool): List<File> {
        return tool.configuration.results.map { results ->
            val dir = Path.of(tool.process({ results.dir })).toFile()
            return if (results.files.isEmpty()) {
                listOf(dir)
            } else {
                val map = results.files.map(FileSystems.getDefault()::getPathMatcher)
                dir.list { file, _ -> map.any { it.matches(file.toPath()) } }?.map(dir::resolve) ?: emptyList()
            }
        }
    }
}
