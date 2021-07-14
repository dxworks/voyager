package org.dxworks.voyager.api.doctor

class DoctorConfig(versions: List<VersionRule>? = null) {
    val versions = versions ?: emptyList()
}
