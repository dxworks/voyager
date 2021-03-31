package org.dxworks.voyager.instruments.config

import org.dxworks.voyager.utils.fieldMissingOrNull
import org.dxworks.voyager.utils.isUnix
import org.dxworks.voyager.utils.logger
import kotlin.system.exitProcess

class Command(
    name: String? = null,
    environment: Map<String, String?>? = null,
    val win: String? = null,
    val unix: String? = null,
    val dir: String? = null
) {
    private val log = logger<Command>()
    val name: String = name ?: run {
        log.error(fieldMissingOrNull("name", "command"))
        exitProcess(1)
    }
    val environment: Map<String, String?> = environment ?: emptyMap()

    val exec: String?
        get() = if (isUnix) unix else win
}
