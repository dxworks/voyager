package org.dxworks.voyager.doctor.config

class DoctorConfig(versions: List<VersionRule>? = null) {
    val versions = versions ?: emptyList()
}
