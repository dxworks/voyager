package org.dxworks.voyager.instruments.config

import org.dxworks.voyager.utils.fieldMissingOrNull
import org.dxworks.voyager.utils.logger
import kotlin.system.exitProcess

class InstrumentConfiguration(
    name: String? = null,
    commands: List<Command>? = null,
    environment: Map<String, String?>? = null,
    parameters: Map<String, String?>? = null,
    run: InstrumentRunStrategy? = null,
    val results: List<ResultsDir>? = null
) {
    private val log = logger<InstrumentConfiguration>()
    val name: String = name ?: run {
        log.error(fieldMissingOrNull("name", "instrument configuration"))
        exitProcess(1)
    }
    val commands: List<Command> = commands ?: emptyList()
    val environment: Map<String, String?> = environment ?: emptyMap()
    val parameters: Map<String, String?> = parameters ?: emptyMap()
    val run: InstrumentRunStrategy = run ?: InstrumentRunStrategy.ONCE
}

