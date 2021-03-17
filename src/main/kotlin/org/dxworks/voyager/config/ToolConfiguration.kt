package org.dxworks.voyager.config

data class ToolConfiguration(
    val name: String,
    val commands: Commands,
    val results: List<ResultsDir>,
    val defaults: Map<String, String> = emptyMap(),
    val onEach: String = "false"
) {
}


