package org.dxworks.voyager.zip

import org.dxworks.voyager.results.FileAndAlias
import org.dxworks.voyager.utils.logger
import java.io.File
import java.io.FileOutputStream
import java.util.zip.ZipEntry
import java.util.zip.ZipOutputStream


class Zipper {
    companion object {
        private val log = logger<Zipper>()
    }

    fun zipFiles(files: List<FileAndAlias>, zipPath: String) {
        val fos = FileOutputStream(zipPath)
        val zipOut = ZipOutputStream(fos)
        files.forEach {
            zipFile(it.file, it.alias, zipOut)
        }
        zipOut.close()
        fos.close()
    }

    private fun zipFile(fileToZip: File, fileName: String, zipOut: ZipOutputStream) {
        if (fileToZip.isDirectory) {
            zipOut.putNextEntry(
                ZipEntry(
                    if (fileName.endsWith("/")) {
                        fileName
                    } else {
                        "$fileName/"
                    }
                )
            )
            zipOut.closeEntry()

            fileToZip.listFiles()?.forEach {
                zipFile(it, fileName + "/" + it.name, zipOut)
            }

            return
        }
        if (!fileToZip.exists()) {
            log.warn("File ${fileToZip.path} does not exist")
        } else {
            val zipEntry = ZipEntry(fileName)
            zipOut.putNextEntry(zipEntry)
            val bytes = fileToZip.readBytes()
            zipOut.write(bytes, 0, bytes.size)
        }
    }
}