package org.dxworks.voyager.config

data class MissionConfig(
    val mission: String,
    val target: String,
    val instruments: Map<String, InstrumentMissionConfiguration>,
    val environment: Map<String, String> = emptyMap(),
    val instrumentsDir: String? = null,
) {
}
