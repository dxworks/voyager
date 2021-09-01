package org.dxworks.voyager.mission

import org.dxworks.voyager.api.global.GlobalConfig
import org.dxworks.voyager.api.mission.MissionConfig
import org.dxworks.voyager.api.utils.pathEnv
import org.dxworks.voyager.api.utils.pathEnvSeparator
import java.nio.file.Path

class EnvironmentManager(private val globalConfig: GlobalConfig, private val missionConfig: MissionConfig? = null) {

    private val runtimeEnvironment = globalConfig.runtimes.values.joinToString(
        separator = pathEnvSeparator,
        postfix = pathEnvSeparator
    ) {
        Path.of(it).toAbsolutePath().toString()
    }

    fun populateEnv(instrumentEnv: Map<String, String>, commandEnv: Map<String, String>, env: MutableMap<String, String>) {
        populatePathEnv(env)
        env.putAll(instrumentEnv.filterNotNullValues())
        env.putAll(commandEnv.filterNotNullValues())
        env.putAll(globalConfig.environment.filterNotNullValues())
        missionConfig?.let { env.putAll(it.environment.filterNotNullValues()) }
    }

    fun populatePathEnv(env: MutableMap<String, String>) {
        env[pathEnv] = runtimeEnvironment + env[pathEnv]
    }

}

fun <K, V> Map<K, V?>.filterNotNullValues(): Map<K, V> =
    mutableMapOf<K, V>().apply {
        for ((k, v) in this@filterNotNullValues) if (v != null) put(k, v)
    }
