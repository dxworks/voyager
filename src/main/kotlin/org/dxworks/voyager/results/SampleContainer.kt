package org.dxworks.voyager.results

import org.dxworks.voyager.zip.Zipper
import java.io.File


class SampleContainer(private val containerName: String) {
    fun fill(instrumentResults: List<InstrumentResult>, missionReport: File? = null): List<FileAndAlias> {
        val entries = instrumentResults.flatMap { it.results }
        val files = fill(missionReport, entries)
        files.forEach { it.file.delete() }
        return files
    }

    private fun fill(
        missionReport: File?,
        entries: List<FileAndAlias>
    ) = if (missionReport?.exists() == true) {
        val files = entries + FileAndAlias(missionReport, missionReport.name)
        Zipper().zipFiles(files, containerName)
        files
    } else {
        Zipper().zipFiles(entries, containerName)
        entries
    }
}
