package org.dxworks.voyager.zip

import org.apache.commons.compress.archivers.ArchiveOutputStream
import org.apache.commons.compress.archivers.zip.ZipArchiveEntry
import org.apache.commons.compress.archivers.zip.ZipArchiveOutputStream
import org.apache.commons.compress.utils.IOUtils
import org.dxworks.voyager.results.FileAndAlias
import org.dxworks.voyager.utils.logger
import java.io.File
import java.io.FileInputStream
import java.io.FileOutputStream
import java.io.IOException

class Zipper {
    companion object {
        private val log = logger<Zipper>()
    }

    fun zipFiles(files: List<FileAndAlias>, zipPath: String): List<FileAndAlias> {
        return ZipArchiveOutputStream(FileOutputStream(zipPath)).use { archive: ZipArchiveOutputStream ->
            files.filter {
                zipFile(it.file, it.alias, archive)
            }
        }
    }

    private fun zipFile(file: File, fileName: String, archive: ArchiveOutputStream<ZipArchiveEntry>): Boolean {
        if (file.isDirectory) {
            return file.listFiles()?.all {
                zipFile(it, fileName + "/" + it.name, archive)
            } ?: true
        }
        if (!file.exists()) {
            log.warn("File ${file.path} does not exist")
            return false
        } else {
            val entry = ZipArchiveEntry(file, fileName)
            return try {
                FileInputStream(file).use { fis ->
                    archive.putArchiveEntry(entry)
                    IOUtils.copy(fis, archive)
                    archive.closeArchiveEntry()
                }
                true
            } catch (e: IOException) {
                log.error("Could not zip file ${file.absolutePath}", e)
                false
            }
        }
    }
}
