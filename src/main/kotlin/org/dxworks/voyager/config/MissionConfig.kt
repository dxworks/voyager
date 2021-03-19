package org.dxworks.voyager.config

data class MissionConfig(
    val mission: String,
    val target: String,
    val instruments: Map<String, InstrumentMissionConfiguration>,
    val instrumentsDir: String? = null
) {
}
