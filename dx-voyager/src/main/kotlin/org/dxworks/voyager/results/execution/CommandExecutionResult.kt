package org.dxworks.voyager.results.execution

import org.dxworks.voyager.api.instruments.config.Command

class CommandExecutionResult(
    val command: Command,
    val elapsedTime: Long,
    val errors: String? = null
)
