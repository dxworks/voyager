package org.dxworks.voyager

import org.junit.jupiter.api.Test

internal class MainKtTest {

    @Test
    fun simpleToolTest() {
        val tools = javaClass.getResource("/simpleToolTest").path.removePrefix("/")
        val base = javaClass.getResource("/filesToPackage").path.removePrefix("/")
        val toolsConfig = javaClass.getResource("/simpleToolTest/toolsConfig.yml").path.removePrefix("/")
        main(arrayOf("-tools=\"$tools\"", "-base=\"$base\"", "-toolsConfig=\"$toolsConfig\""))
    }
}
