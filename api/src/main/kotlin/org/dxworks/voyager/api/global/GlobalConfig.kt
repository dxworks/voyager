package org.dxworks.voyager.api.global

class GlobalConfig(
    runsAll: Boolean? = null,
    environment: Map<String, String?>? = null,
    runtimes: Map<String, String>? = null,
    val instrumentsDir: String? = null,
) {
    val runsAll: Boolean = runsAll ?: true
    val environment: Map<String, String?> = environment ?: emptyMap()
    val runtimes: Map<String, String> = runtimes ?: emptyMap()
}
