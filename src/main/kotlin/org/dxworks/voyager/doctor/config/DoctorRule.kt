package org.dxworks.voyager.doctor.config

import org.dxworks.voyager.utils.fieldMissingOrNull
import org.dxworks.voyager.utils.isUnix
import org.dxworks.voyager.utils.logger
import kotlin.system.exitProcess

class DoctorRule(
    name: String? = null,
    val win: String? = null,
    val unix: String? = null,
    val dir: String? = null,
    val errorMessage: String? = null,
    match: List<String>? = null
) {
    private val log = logger<DoctorRule>()
    val name: String = name ?: run {
        log.error(fieldMissingOrNull("name", "doctor rule"))
        exitProcess(1)
    }
    val match: List<String> = match ?: emptyList()

    val exec: String?
        get() = if (isUnix) unix else win
}
