package org.dxworks.voyager.results

import org.dxworks.voyager.zip.Zipper


class ResultsPackager {
    fun packageResults(instrumentResults: List<InstrumentResult>) {
        Zipper().zipFiles(instrumentResults.flatMap { it.results }, "Dx-Voyager.zip")
    }
}
