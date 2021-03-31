package org.dxworks.voyager.doctor.config

import org.dxworks.voyager.utils.fieldMissingOrNull
import org.dxworks.voyager.utils.isUnix
import org.dxworks.voyager.utils.logger
import kotlin.system.exitProcess

private const val versionRule = "version rule"

class VersionRule(
    name: String? = null,
    min: String? = null,
    val win: String? = null,
    val unix: String? = null,
    val dir: String? = null,
    match: List<String>? = null
) {
    private val log = logger<VersionRule>()
    val name: String = name ?: run {
        log.error(fieldMissingOrNull("name", versionRule))
        exitProcess(1)
    }
    val min: String = min ?: run {
        log.error(fieldMissingOrNull("min", versionRule))
        exitProcess(1)
    }


    val match: List<String> = match ?: emptyList()

    val exec: String?
        get() = if (isUnix) unix else win
}
