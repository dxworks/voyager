package org.dxworks.voyager.results

import org.junit.jupiter.api.Test
import java.nio.file.Path

internal class ResultsPackagerTest {

    @Test
    fun packageResults() {
        val resource = javaClass.getResource("/filesToPackage")
        val rootFolder = resource.path
        ResultsPackager().packageResults(
            listOf(
                Path.of("$rootFolder/resultFolder1/result1").toFile(),
                Path.of("$rootFolder/resultFolder2/resultFolder21").toFile(),
                Path.of("$rootFolder/result").toFile(),
            )
        )
    }
}
