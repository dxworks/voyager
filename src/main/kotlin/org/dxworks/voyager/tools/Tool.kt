package org.dxworks.voyager.tools

import org.dxworks.voyager.config.ConfigurationProcessor
import org.dxworks.voyager.config.ToolConfiguration
import org.dxworks.voyager.config.toolHomeField

open class Tool(val path: String, val configuration: ToolConfiguration) {
    val name = configuration.name

    fun process(template: String, vararg additionalFields: Pair<String, String>): String {
        return ConfigurationProcessor.get().process(template, *additionalFields, toolHomeField to path)
    }
}
