package org.dxworks.voyager.samples

import org.dxworks.voyager.zip.Zipper


class SampleContainer(private val containerName: String) {
    fun fill(instrumentSamples: List<InstrumentSample>) {
        Zipper().zipFiles(instrumentSamples.flatMap { it.samples }, containerName)
    }
}
