package org.dxworks.voyager.results

import org.dxworks.voyager.zip.Zipper


class ResultsPackager {
    fun packageResults(paths: List<String>) {
        Zipper().zipFiles(paths, "Dx-Voyager.zip")
    }
}
