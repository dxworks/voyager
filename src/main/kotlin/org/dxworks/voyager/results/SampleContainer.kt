package org.dxworks.voyager.results

import org.dxworks.voyager.zip.Zipper
import java.io.File


class SampleContainer(private val containerName: String) {
    fun fill(instrumentResults: List<InstrumentResult>, vararg reports: File): List<FileAndAlias> {
        val entries = instrumentResults.flatMap { it.results }
        val files = entries + reports.map { FileAndAlias(it, it.name) }
        Zipper().zipFiles(files, containerName)
        return files
    }

}
