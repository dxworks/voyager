package org.dxworks.voyager.utils

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.dataformat.yaml.YAMLFactory
import com.fasterxml.jackson.module.kotlin.registerKotlinModule
import org.slf4j.Logger
import org.slf4j.LoggerFactory


inline fun <reified T : Any> logger(): Logger = LoggerFactory.getLogger(T::class.java)
val yamlMapper = ObjectMapper(YAMLFactory()).registerKotlinModule()

private val osName by lazy { System.getProperty("os.name") }
val isWindows by lazy { osName.contains("win", ignoreCase = true) }
val isLinux by lazy { osName.contains("nux", ignoreCase = true) || osName.contains("nix", ignoreCase = true) }
val isMac by lazy { osName.contains("mac", ignoreCase = true) }
val isUnix by lazy { isLinux || isMac }
val commandInterpreterName by lazy { if (isUnix) "bash" else "cmd.exe" }
val interpreterArg by lazy { if (isUnix) "-c" else "/C" }
val pathEnvSeparator by lazy { if (isUnix) ":" else ";" }

val pathEnv by lazy { if (isUnix) "PATH" else "Path" }


inline fun <T> Iterable<T>.sumByLong(selector: (T) -> Long): Long {
    var sum = 0L
    for (element in this) {
        sum += selector(element)
    }
    return sum
}
