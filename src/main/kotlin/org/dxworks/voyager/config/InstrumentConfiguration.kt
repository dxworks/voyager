package org.dxworks.voyager.config

data class InstrumentConfiguration(
    val name: String,
    val commands: Commands,
    val results: List<ResultsDir>,
    val defaults: Map<String, String> = emptyMap(),
    val onEach: String = "false"
) {
}


