package org.dxworks.voyager.config

import freemarker.template.Configuration
import freemarker.template.Template
import java.io.StringWriter

const val toolHomeField = "toolHome"
const val baseAnalysisFolder = "baseAnalysisFolder"
const val currentProjectFolder = "currentProjectFolder"

class ConfigurationProcessor private constructor() {
    internal val fields: MutableMap<String, String> = HashMap()

    companion object {
        private var singleton: ConfigurationProcessor? = null
        fun get() = singleton ?: ConfigurationProcessor().also { singleton = it }
    }

    fun addValue(key: String, value: String) {
        fields[key] = value
    }

    fun process(template: String, vararg additionalFields: Pair<String, String>): String {
        return StringWriter().also {
            Template("", template, defaultConfiguration).process(
                fields + additionalFields,
                it
            )
        }.toString()
    }
}

private val defaultConfiguration = Configuration(Configuration.DEFAULT_INCOMPATIBLE_IMPROVEMENTS)

fun String.processTemplate() = StringWriter().also {
    Template("", this, defaultConfiguration).process(ConfigurationProcessor.get().fields, it)
}.toString()
