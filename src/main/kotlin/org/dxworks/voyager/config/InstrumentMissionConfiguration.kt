package org.dxworks.voyager.config

data class InstrumentMissionConfiguration(
    val commands: List<String>?,
    val parameters: Map<String, String> = emptyMap()
)
