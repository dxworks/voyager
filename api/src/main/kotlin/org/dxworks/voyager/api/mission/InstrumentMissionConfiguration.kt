package org.dxworks.voyager.api.mission

import org.dxworks.voyager.utils.defaultThreadId

class InstrumentMissionConfiguration(
    val commands: List<String>?,
    val parameters: Map<String, String> = emptyMap(),
    thread: Int? = null
) {
    val thread = thread ?: defaultThreadId
}
