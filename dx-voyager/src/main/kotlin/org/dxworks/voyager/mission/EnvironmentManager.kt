package org.dxworks.voyager.mission

import org.dxworks.voyager.api.global.GlobalConfig
import org.dxworks.voyager.api.instruments.config.Command
import org.dxworks.voyager.api.mission.MissionConfig
import org.dxworks.voyager.api.utils.pathEnv
import org.dxworks.voyager.api.utils.pathEnvSeparator
import org.dxworks.voyager.instruments.Instrument
import java.nio.file.Path

class EnvironmentManager(val globalConfig: GlobalConfig, val missionConfig: MissionConfig) {

    val runtimeEnvironment = globalConfig.runtimes.values.joinToString(
        separator = pathEnvSeparator,
        postfix = pathEnvSeparator
    ) {
        Path.of(it).toAbsolutePath().toString()
    }

    fun populateEnv(instrument: Instrument, command: Command, env: MutableMap<String, String>) {
        populatePathEnv(env)
        env.putAll(instrument.configuration.environment.filterNotNullValues())
        env.putAll(command.environment.filterNotNullValues())
        env.putAll(globalConfig.environment.filterNotNullValues())
        env.putAll(missionConfig.environment.filterNotNullValues())
    }

    fun populatePathEnv(env: MutableMap<String, String>) {
        env[pathEnv] = runtimeEnvironment + env[pathEnv]
    }

}

fun <K, V> Map<K, V?>.filterNotNullValues(): Map<K, V> =
    mutableMapOf<K, V>().apply {
        for ((k, v) in this@filterNotNullValues) if (v != null) put(k, v)
    }
