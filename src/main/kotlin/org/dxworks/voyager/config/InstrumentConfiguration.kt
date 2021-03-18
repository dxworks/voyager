package org.dxworks.voyager.config

data class InstrumentConfiguration(
    val name: String,
    val commands: Commands,
    val samples: List<SamplesDir>?,
    val parameters: Map<String, String?> = emptyMap(),
    val onEach: Boolean = false
)
