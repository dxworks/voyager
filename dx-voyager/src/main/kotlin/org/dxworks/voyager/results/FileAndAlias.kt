package org.dxworks.voyager.results

import java.io.File

class FileAndAlias(val file: File, alias: String) {
    val alias = alias.replace("\\", "/")
}
