package org.dxworks.voyager.config

import com.fasterxml.jackson.module.kotlin.readValue
import freemarker.template.Configuration
import freemarker.template.Template
import org.dxworks.voyager.tools.Tool
import java.io.StringWriter
import java.nio.file.Paths

const val toolHomeField = "toolHome"
const val baseAnalysisFolder = "baseAnalysisFolder"
const val currentProjectFolder = "currentProjectFolder"


class ConfigurationProcessor private constructor() {
    private val fields: MutableMap<String, String> = HashMap()
    private val toolFields: MutableMap<String, MutableMap<String, String>> = HashMap()

    companion object {
        private var singleton: ConfigurationProcessor? = null
        fun get() = singleton ?: ConfigurationProcessor().also { singleton = it }
    }

    fun setConfigurationSource(sourceFile: String) {
        val file = Paths.get(sourceFile).toFile()
        if (file.exists()) {
            toolFields.putAll(yamlMapper.readValue<Map<String, MutableMap<String, String>>>(file))
        }
    }

    fun addValue(key: String, value: String) {
        fields[key] = value
    }

    fun addValue(tool: Tool, key: String, value: String) {
        getToolFields(tool)[key] = value
    }

    private fun getToolFields(tool: Tool) = toolFields.computeIfAbsent(tool.name) { HashMap() }

    fun process(tool: Tool, template: String, vararg additionalFields: Pair<String, String>): String {
        return StringWriter().also {
            Template("", template, defaultConfiguration).process(
                fields + getToolFieldsWithDefaults(tool) + additionalFields, it
            )
        }.toString()
    }

    private fun getToolFieldsWithDefaults(tool: Tool): Map<String, String> {
        return getToolFields(tool).apply { tool.configuration.defaults.forEach { (k, v) -> putIfAbsent(k, v) } }
    }
}

private val defaultConfiguration = Configuration(Configuration.DEFAULT_INCOMPATIBLE_IMPROVEMENTS)
