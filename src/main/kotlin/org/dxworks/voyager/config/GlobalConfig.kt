package org.dxworks.voyager.config

class GlobalConfig(
    val runsAll: Boolean = true,
    val instrumentsDir: String? = null,
    val environments: Map<String, String> = emptyMap()
)
