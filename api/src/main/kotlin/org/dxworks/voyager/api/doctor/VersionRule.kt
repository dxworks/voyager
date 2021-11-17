package org.dxworks.voyager.api.doctor

import org.dxworks.voyager.api.utils.fieldMissingOrNull
import org.dxworks.voyager.api.utils.isUnix


class VersionRule(
    name: String? = null,
    min: String? = null,
    val win: String? = null,
    val unix: String? = null,
    val dir: String? = null,
    match: List<String>? = null
) {
    val name: String = name ?: run {
        throw IllegalStateException(fieldMissingOrNull("name", versionRule))
    }

    val min: String = min ?: run {
        throw IllegalStateException(fieldMissingOrNull("min", versionRule))
    }
    val match: List<String> = match ?: emptyList()


    val exec: String?
        get() = if (isUnix) unix else win

    companion object {
        private const val versionRule = "version rule"
    }
}
