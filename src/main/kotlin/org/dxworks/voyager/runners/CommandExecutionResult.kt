package org.dxworks.voyager.runners

import org.dxworks.voyager.config.Command

class CommandExecutionResult(
    val command: Command,
    val elapsedTime: Long,
    val errors: String? = null
)
