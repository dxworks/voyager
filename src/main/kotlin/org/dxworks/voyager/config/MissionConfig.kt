package org.dxworks.voyager.config

import org.dxworks.voyager.utils.fieldMissingOrNull
import org.dxworks.voyager.utils.logger
import kotlin.system.exitProcess

class MissionConfig(
    mission: String? = null,
    target: String? = null,
    instruments: Map<String, InstrumentMissionConfiguration>? = null,
    environment: Map<String, String?>? = null,
    val instrumentsDir: String? = null
) {
    private val log = logger<MissionConfig>()
    val mission: String = mission ?: run {
        log.error(fieldMissingOrNull("mission", "mission config"))
        exitProcess(1)
    }
    val target: String = target ?: run {
        log.error(fieldMissingOrNull("target", "mission config"))
        exitProcess(1)
    }
    val environment: Map<String, String?> = environment ?: emptyMap()
    val instruments: Map<String, InstrumentMissionConfiguration> = instruments ?: emptyMap()
}
