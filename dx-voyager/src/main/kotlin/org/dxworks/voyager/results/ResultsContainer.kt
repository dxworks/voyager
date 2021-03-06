package org.dxworks.voyager.results

import org.dxworks.voyager.zip.Zipper
import java.io.File


class ResultsContainer(private val containerName: String) {
    fun fill(
        instrumentResults: List<InstrumentResult>,
        vararg reports: File,
        beforeZip: (containerContent: List<FileAndAlias>) -> Unit
    ): List<FileAndAlias> {
        val entries = instrumentResults.flatMap { it.results }
        val files = entries + reports.map { FileAndAlias(it, it.name) }
        beforeZip(files)
        return Zipper().zipFiles(files, containerName)
    }
}
