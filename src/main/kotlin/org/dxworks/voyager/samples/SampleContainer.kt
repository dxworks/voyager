package org.dxworks.voyager.samples

import org.dxworks.voyager.zip.Zipper
import java.io.File


class SampleContainer(private val containerName: String) {
    fun fill(instrumentSamples: List<InstrumentSample>, missionReport: File? = null) {
        val entries = instrumentSamples.flatMap { it.samples }
        if (missionReport?.exists() == true) {
            Zipper().zipFiles(entries + FileAndAlias(missionReport, missionReport.name), containerName)
        } else {
            Zipper().zipFiles(entries, containerName)
        }
    }
}
