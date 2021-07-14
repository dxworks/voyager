package org.dxworks.voyager.api.instruments.config

import org.dxworks.voyager.api.utils.fieldMissingOrNull
import org.dxworks.voyager.api.utils.isUnix

class Command(
    name: String? = null,
    environment: Map<String, String?>? = null,
    val win: String? = null,
    val unix: String? = null,
    val dir: String? = null
) {
    val name: String = name ?: run {
        throw IllegalStateException(fieldMissingOrNull("name", "command"))
    }
    val environment: Map<String, String?> = environment ?: emptyMap()

    val exec: String?
        get() = if (isUnix) unix else win
}
