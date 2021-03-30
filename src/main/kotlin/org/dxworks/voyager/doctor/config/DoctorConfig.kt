package org.dxworks.voyager.doctor.config

class DoctorConfig(rules: List<DoctorRule>? = null) {
    val rules = rules ?: emptyList()
}
