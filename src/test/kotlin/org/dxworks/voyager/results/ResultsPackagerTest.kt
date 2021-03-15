package org.dxworks.voyager.results

import org.junit.jupiter.api.Test

internal class ResultsPackagerTest {

    @Test
    fun packageResults() {
        val resource = javaClass.getResource("/filesToPackage")
        val rootFolder = resource.path
        ResultsPackager().packageResults(
            listOf(
                "$rootFolder/resultFolder1/result1",
                "$rootFolder/resultFolder2/resultFolder21",
                "$rootFolder/result",
            )
        )
    }
}
