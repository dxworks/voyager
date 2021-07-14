package org.dxworks.voyager.api.instruments.config

import com.fasterxml.jackson.annotation.JsonCreator
import com.fasterxml.jackson.annotation.JsonValue

enum class InstrumentRunStrategy(@get:JsonValue val label: String) {
    ON_EACH("onEach"),
    ONCE("once"),
    NEVER("never");

    companion object {
        @JsonCreator
        @JvmStatic
        fun fromLabel(label: String): InstrumentRunStrategy =
            values().firstOrNull { it.label == label } ?: ONCE
    }
}
