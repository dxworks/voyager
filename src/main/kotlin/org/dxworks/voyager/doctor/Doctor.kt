package org.dxworks.voyager.doctor

import com.fasterxml.jackson.module.kotlin.readValue
import com.vdurmont.semver4j.Semver
import org.dxworks.voyager.config.MissionControl
import org.dxworks.voyager.doctor.config.DoctorConfig
import org.dxworks.voyager.utils.commandInterpreterName
import org.dxworks.voyager.utils.interpreterArg
import org.dxworks.voyager.utils.versionGroupName
import org.dxworks.voyager.utils.yamlMapper
import org.slf4j.LoggerFactory
import java.nio.file.Path


fun versionDoctor(doctorFile: String): Boolean {
    val log = LoggerFactory.getLogger("VersionDoctor")
    val config = readDoctorConfig(doctorFile)
    return config.versions.map { rule ->
        try {
            log.info("Checking ${rule.name}")
            val process = MissionControl.get().getProcessBuilder()
                .directory(Path.of(rule.dir ?: ".").toAbsolutePath().normalize().toFile())
                .command(commandInterpreterName, interpreterArg, rule.exec)
                .start()
            process.waitFor()

            val std = String(process.inputStream.readAllBytes())
            val err = String(process.errorStream.readAllBytes())

            log.info(rule.exec)
            std.split("\n").forEach { log.info(it) }
            err.split("\n").forEach { log.info(it) }

            val version = rule.match.map { it.toRegex() }
                .map { it.find(std) ?: it.find(err) }.firstOrNull()
                ?.let { it.groups[versionGroupName] }?.value
                ?: run {
                    log.warn("${rule.name} version check failed because there was no match")
                    null
                }
            if (version == null) {
                false
            } else {
                val semver = Semver(version, Semver.SemverType.LOOSE)
                val isOk = semver.isGreaterThanOrEqualTo(rule.min)
                if (isOk) {
                    log.info("${rule.name} version check passed ($semver)")
                } else {
                    log.warn("${rule.name} version check failed because the found version was $semver which is lower than the required ${rule.min}")
                }
                isOk
            }
        } catch (e: Exception) {
            log.error("${rule.name} version check failed because '${e.message}'")
            false
        }
    }.reduce(Boolean::and)
}

private fun readDoctorConfig(doctorFile: String) =
    yamlMapper.readValue<DoctorConfig>(Path.of(doctorFile).toFile())
