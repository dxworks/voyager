package org.dxworks.voyager.api.instruments.config

import org.dxworks.voyager.api.utils.fieldMissingOrNull

class InstrumentConfiguration(
    name: String? = null,
    commands: List<Command>? = null,
    environment: Map<String, String?>? = null,
    parameters: Map<String, String?>? = null,
    run: InstrumentRunStrategy? = null,
    val results: List<ResultsDir>? = null
) {
    val name: String = name ?: run {
        throw IllegalStateException(fieldMissingOrNull("name", "instrument configuration"))
    }
    val commands: List<Command> = commands ?: emptyList()
    val environment: Map<String, String?> = environment ?: emptyMap()
    val parameters: Map<String, String?> = parameters ?: emptyMap()
    val run: InstrumentRunStrategy = run ?: InstrumentRunStrategy.ONCE
}
