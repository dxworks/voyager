package org.dxworks.voyager.api.mission

import org.dxworks.voyager.api.utils.fieldMissingOrNull

class MissionConfig(
    mission: String? = null,
    target: String? = null,
    instruments: Map<String, InstrumentMissionConfiguration>? = null,
    environment: Map<String, String?>? = null,
    val instrumentsDir: String? = null
) {
    val mission: String = mission ?: run {
        throw IllegalStateException(fieldMissingOrNull("mission", "mission config"))
    }
    val target: String = target ?: run {
        throw IllegalStateException(fieldMissingOrNull("target", "mission config"))
    }
    val environment: Map<String, String?> = environment ?: emptyMap()
    val instruments: Map<String, InstrumentMissionConfiguration> = instruments ?: emptyMap()
}
