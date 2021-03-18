package org.dxworks.voyager.config

data class MissionConfig(
    val mission: String,
    val region: String,
    val instruments: Map<String, InstrumentMissionConfiguration>
)
