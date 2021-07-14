package org.dxworks.voyager.utils

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.dataformat.yaml.YAMLFactory
import com.fasterxml.jackson.module.kotlin.registerKotlinModule
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import kotlin.system.exitProcess


inline fun <reified T : Any> logger(): Logger = LoggerFactory.getLogger(T::class.java)
val yamlMapper = ObjectMapper(YAMLFactory()).registerKotlinModule()
