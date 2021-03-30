package org.dxworks.voyager.doctor

import com.fasterxml.jackson.module.kotlin.readValue
import org.dxworks.voyager.config.MissionControl
import org.dxworks.voyager.doctor.config.DoctorConfig
import org.dxworks.voyager.utils.commandInterpreterName
import org.dxworks.voyager.utils.interpreterArg
import org.dxworks.voyager.utils.yamlMapper
import org.slf4j.LoggerFactory
import java.nio.file.Path


fun doctor(doctorFile: String): Boolean {
    val log = LoggerFactory.getLogger("Doctor")
    val config = readDoctorConfig(doctorFile)
    return config.rules.map { rule ->
        try {

            val process = MissionControl.get().getProcessBuilder()
                .directory(Path.of(rule.dir ?: ".").toAbsolutePath().normalize().toFile())
                .command(commandInterpreterName, interpreterArg, rule.exec)
                .start()
            process.waitFor()

            val std = String(process.inputStream.readAllBytes())
            val err = String(process.errorStream.readAllBytes())
            val anyMatch = rule.match.map { it.toRegex() }
                .any { it.containsMatchIn(std) || it.containsMatchIn(err) }
            if (anyMatch) {
                log.info("${rule.name} rule passed")
            } else {
                log.warn("${rule.name} rule failed")
                rule.errorMessage?.let { log.warn(it) }
            }
            anyMatch
        } catch (e: Exception) {
            log.error("${rule.name} rule failed with errors", e)
            false
        }
    }.reduce(Boolean::and)
}

private fun readDoctorConfig(doctorFile: String) =
    yamlMapper.readValue<DoctorConfig>(Path.of(doctorFile).toFile())
