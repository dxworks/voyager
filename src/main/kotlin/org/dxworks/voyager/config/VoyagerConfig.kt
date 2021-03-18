package org.dxworks.voyager.config

data class VoyagerConfig(
    val instruments: Map<String, Map<String, String>> = emptyMap()
)
