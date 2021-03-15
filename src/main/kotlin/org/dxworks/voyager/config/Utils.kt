package org.dxworks.voyager.config

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.dataformat.yaml.YAMLFactory
import com.fasterxml.jackson.module.kotlin.registerKotlinModule

val yamlMapper = ObjectMapper(YAMLFactory()).registerKotlinModule()

const val executionConfigName = "config.yaml"
