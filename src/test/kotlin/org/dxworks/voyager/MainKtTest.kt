package org.dxworks.voyager

import org.junit.jupiter.api.Test

internal class MainKtTest {

    @Test
    fun simpleToolTest() {
        val tools = javaClass.getResource("/simpleToolTest").path.removePrefix("/")
        val base = javaClass.getResource("/testProjectFolder").path.removePrefix("/")
        main(arrayOf("-tools=\"$tools\"", "-base=\"$base\""))
    }
}
