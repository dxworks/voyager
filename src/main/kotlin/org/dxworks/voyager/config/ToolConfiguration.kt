package org.dxworks.voyager.config

data class ToolConfiguration(
    val name: String,
    val commands: Commands,
    val resultsPath: String,
    val defaults: Map<String, String> = emptyMap(),
    val onEach: Boolean = false
) {
}


