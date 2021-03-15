package org.dxworks.voyager.config

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.dataformat.yaml.YAMLFactory
import com.fasterxml.jackson.module.kotlin.readValue
import com.fasterxml.jackson.module.kotlin.registerKotlinModule
import java.io.File
import java.nio.file.Paths

class ConfigReader {
    private val mapper = ObjectMapper(YAMLFactory()).registerKotlinModule()

    fun read(fileName: String) = read(Paths.get(fileName).toFile())

    private fun read(file: File): ToolConfiguration = mapper.readValue(file)
}
