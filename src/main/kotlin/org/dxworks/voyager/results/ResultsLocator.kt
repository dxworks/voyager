package org.dxworks.voyager.results

import org.dxworks.voyager.instruments.Instrument
import java.nio.file.FileSystems
import java.nio.file.Path

class ResultsLocator {
    fun locate(instrument: Instrument): InstrumentResult {
        return InstrumentResult(instrument, instrument.configuration.results.flatMap { results ->
            val dir = Path.of(instrument.process({ results.dir })).toFile()
            if (results.files.isEmpty()) {
                listOf(FileAndAlias(dir, instrument.name))
            } else {
                val pathMatchers = results.files.map(FileSystems.getDefault()::getPathMatcher)
                dir.walkTopDown().filter { file ->
                    pathMatchers.any {
                        it.matches(dir.toPath().relativize(file.toPath()))
                    }
                }.map {
                    FileAndAlias(
                        it,
                        Path.of(instrument.name, dir.toPath().relativize(it.toPath()).toString()).toString()
                    )
                }.toList()
            }
        })
    }
}
