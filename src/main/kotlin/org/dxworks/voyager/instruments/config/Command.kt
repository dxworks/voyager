package org.dxworks.voyager.instruments.config

import org.dxworks.voyager.utils.isUnix

data class Command(
    val name: String,
    val win: String?,
    val unix: String?,
    val dir: String? = null
) {
    val exec: String?
        get() = if (isUnix) unix else win
}
