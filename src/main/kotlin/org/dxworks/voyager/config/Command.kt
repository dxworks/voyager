package org.dxworks.voyager.config

data class Command(
    val name: String? = null,
    val exec: String,
    val dir: String? = null
)
