package org.dxworks.voyager.instruments.config

data class InstrumentConfiguration(
    val name: String,
    val commands: List<Command>?,
    val results: List<ResultsDir>?,
    val parameters: Map<String, String?> = emptyMap(),
    val run: InstrumentRunStrategy = InstrumentRunStrategy.ONCE
)
