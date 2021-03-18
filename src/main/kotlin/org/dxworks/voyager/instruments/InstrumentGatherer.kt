package org.dxworks.voyager.instruments

import com.fasterxml.jackson.module.kotlin.readValue
import org.dxworks.voyager.utils.defaultInstrumentConfig
import org.dxworks.voyager.utils.logger
import org.dxworks.voyager.utils.yamlMapper
import java.io.File
import java.io.FileFilter
import java.nio.file.Path

class InstrumentGatherer(baseFolder: String) {
    companion object {
        private val log = logger<InstrumentGatherer>()
    }

    val instruments: List<Instrument>

    init {
        instruments =
            Path.of(baseFolder).toFile().listFiles(FileFilter { it.isInstrumentFolder() })
                ?.mapNotNull { createInstrument(it) }
                ?: emptyList()
    }

    private fun createInstrument(it: File): Instrument? {
        val absolutePath = it.absolutePath
        return try {
            Instrument(absolutePath, yamlMapper.readValue(it.resolve(defaultInstrumentConfig)))
        } catch (e: Exception) {
            log.error("Instrument at $absolutePath could not be added", e)
            return null
        }
    }
}

private fun File.isInstrumentFolder(): Boolean {
    return list()?.contains(defaultInstrumentConfig) ?: false
}
