package org.dxworks.voyager.results

import org.dxworks.voyager.zip.Zipper
import java.io.File


class SampleContainer(private val containerName: String) {
    fun fill(instrumentresults: List<InstrumentResult>, missionReport: File? = null): List<FileAndAlias> {
        val entries = instrumentresults.flatMap { it.results }
        return if (missionReport?.exists() == true) {
            val files = entries + FileAndAlias(missionReport, missionReport.name)
            Zipper().zipFiles(files, containerName)
            files
        } else {
            Zipper().zipFiles(entries, containerName)
            entries
        }
    }
}
