package org.dxworks.voyager.tools

import org.dxworks.voyager.config.ConfigurationProcessor
import org.dxworks.voyager.config.ToolConfiguration
import org.dxworks.voyager.config.toolHomeField

open class Tool(val path: String, val configuration: ToolConfiguration) {
    val name = configuration.name

    fun process(
        configFieldProvider: (ToolConfiguration) -> String,
        vararg additionalFields: Pair<String, String>
    ): String {
        return ConfigurationProcessor.get()
            .process(this, configFieldProvider.invoke(configuration), *additionalFields, toolHomeField to path)
    }
}
