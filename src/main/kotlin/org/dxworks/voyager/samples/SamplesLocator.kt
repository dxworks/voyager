package org.dxworks.voyager.samples

import org.dxworks.voyager.instruments.Instrument
import java.nio.file.FileSystems
import java.nio.file.Path

class SamplesLocator {
    fun locate(instrument: Instrument): InstrumentSample? {
        return instrument.configuration.samples?.let { samples ->
            InstrumentSample(instrument, samples.flatMap { results ->
                val dir = Path.of(instrument.process({ results.dir })).toFile()
                if (results.files.isEmpty()) {
                    listOf(FileAndAlias(dir, Path.of(instrument.name, dir.name).toString()))
                } else {
                    val pathMatchers = results.files.map(FileSystems.getDefault()::getPathMatcher)
                    dir.walkTopDown().filter { file ->
                        pathMatchers.any { it.matches(dir.toPath().relativize(file.toPath())) }
                    }.map {
                        FileAndAlias(
                            it,
                            Path.of(instrument.name, dir.name, dir.toPath().relativize(it.toPath()).toString())
                                .toString()
                        )
                    }.toList()
                }
            })
        }
    }
}
