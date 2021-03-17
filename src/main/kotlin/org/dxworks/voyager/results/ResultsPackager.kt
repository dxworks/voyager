package org.dxworks.voyager.results

import org.dxworks.voyager.zip.Zipper
import java.io.File


class ResultsPackager {
    fun packageResults(files: List<File>) {
        Zipper().zipFiles(files, "Dx-Voyager.zip")
    }
}
