package org.dxworks.voyager.api.mission

import org.dxworks.voyager.api.utils.fieldMissingOrNull
import org.dxworks.voyager.utils.defaultContainerName
import java.io.File

class MissionConfig(
    mission: String? = null,
    target: String? = null,
    resultsPath: String? = null,
    instruments: Map<String, InstrumentMissionConfiguration>? = null,
    environment: Map<String, String?>? = null,
    val instrumentsDir: String? = null
) {
    val mission: String = mission ?: run {
        throw IllegalStateException(fieldMissingOrNull("mission", "mission config"))
    }
    val target: String =
        if (target != null) {
            val targetFile = File(target)
            if (targetFile.exists() && targetFile.isDirectory)
                target
            else run {
                throw IllegalStateException("Target directory $target does not exist")
            }
        } else run {
            throw IllegalStateException(fieldMissingOrNull("target", "mission config"))
        }
    val environment: Map<String, String?> = environment ?: emptyMap()
    val instruments: Map<String, InstrumentMissionConfiguration> = instruments ?: emptyMap()
    val resultsPath: String = resultsPath ?: "${mission}-$defaultContainerName"
}
