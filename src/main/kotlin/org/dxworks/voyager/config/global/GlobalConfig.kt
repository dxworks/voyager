package org.dxworks.voyager.config.global

class GlobalConfig(
    val runsAll: Boolean = true,
    val instrumentsDir: String? = null,
    val environment: Map<String, String> = emptyMap(),
    val runtimes: Map<String, String> = emptyMap()
)
