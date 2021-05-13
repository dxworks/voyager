package org.dxworks.voyager.config

import org.dxworks.voyager.utils.defaultThreadId

class InstrumentMissionConfiguration(
    val commands: List<String>?,
    val parameters: Map<String, String> = emptyMap(),
    thread: Int? = null
) {
    val thread = thread ?: defaultThreadId
}
