package org.dxworks.voyager.config

data class InstrumentConfiguration(
    val name: String,
    val commands: List<Command>?,
    val results: List<ResultsDir>?,
    val parameters: Map<String, String?> = emptyMap(),
    val onEach: Boolean = false
)
