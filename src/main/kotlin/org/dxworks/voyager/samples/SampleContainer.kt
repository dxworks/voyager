package org.dxworks.voyager.samples

import org.dxworks.voyager.zip.Zipper
import java.io.File


class SampleContainer(private val containerName: String) {
    fun fill(instrumentSamples: List<InstrumentSample>, missionReport: File? = null): List<FileAndAlias> {
        val entries = instrumentSamples.flatMap { it.samples }
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
