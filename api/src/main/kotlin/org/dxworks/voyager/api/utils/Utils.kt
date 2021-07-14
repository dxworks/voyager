package org.dxworks.voyager.api.utils


private val osName by lazy { System.getProperty("os.name") }
val isWindows by lazy { osName.contains("win", ignoreCase = true) }
val isLinux by lazy { osName.contains("nux", ignoreCase = true) || osName.contains("nix", ignoreCase = true) }
val isMac by lazy { osName.contains("mac", ignoreCase = true) }
val isUnix by lazy { isLinux || isMac }
val commandInterpreterName by lazy { if (isUnix) "bash" else "cmd.exe" }
val interpreterArg by lazy { if (isUnix) "-c" else "/C" }
val pathEnvSeparator by lazy { if (isUnix) ":" else ";" }

val pathEnv by lazy { if (isUnix) "PATH" else "Path" }

fun fieldMissingOrNull(field: String, source: String): String = "'$field' field is missing or null in $source"
