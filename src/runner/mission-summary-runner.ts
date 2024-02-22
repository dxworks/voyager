import AdmZip from 'adm-zip'
import {MISSION_RESULT_ARCHIVE_NAME} from '../context/context-variable-provider'
import fs from 'fs'
import path from 'node:path'
import {exec} from 'node:child_process'
import {OS, osType} from '@dxworks/cli-common'
import {buildLegacyMissionSummary} from '../report/legacy-report-extactor'
import {generateHtmlReportContent} from '../report/html/html-report-generator'
import {getHtmlLogContent} from '../report/html/html-report-utils'

export function openMissionSummary(zipPath: string): void {
    const zip = new AdmZip(zipPath)
    const zipEntries = zip.getEntries()
    const htmlEntry = zipEntries.find(entry => entry.entryName === MISSION_RESULT_ARCHIVE_NAME)
    const htmlFolderEntries: AdmZip.IZipEntry[] = []

    zipEntries.forEach(entry => {
        if (entry.entryName.startsWith('html/') && !entry.isDirectory) {
            htmlFolderEntries.push(entry)
        }
    })

    if (!htmlEntry) {
        console.error('No HTML file found in the zip.')
        return
    }

    const tempDir = fs.mkdtempSync('mission_summary-')
    const tempHtmlPath = path.join(tempDir, 'MissionReport.html')
    zip.extractEntryTo(htmlEntry.entryName, tempDir, false, true)

    const tempHtmlFolderPath = path.join(tempDir, 'html')
    fs.mkdirSync(tempHtmlFolderPath)
    htmlFolderEntries.forEach(entry => {
        zip.extractEntryTo(entry.entryName, tempHtmlFolderPath, false, true)
    })

    openFile(tempHtmlPath)
}

export function buildAndOpenLegacySummary(zipPath: string): void {
    const zip = new AdmZip(zipPath)
    const textFileEntry = zip.getEntries().find(entry => entry.entryName === 'mission-report.log')
    if (!textFileEntry) {
        console.error('Text report file not found in the zip archive.')
        return
    }
    const fileContent = zip.readAsText(textFileEntry)
    const missionSummary = buildLegacyMissionSummary(fileContent)
    const legacyHtmlReport = generateHtmlReportContent(missionSummary)
    const tempDir = fs.mkdtempSync('mission_summary-')
    const tempHtmlPath = path.join(tempDir, 'MissionReport.html')
    fs.writeFileSync(tempHtmlPath, legacyHtmlReport)
    const tempHtmlFolderPath = path.join(tempDir, 'html')
    fs.mkdirSync(tempHtmlFolderPath)

    const logFilesEntries = zip.getEntries().filter(entry => entry.entryName.endsWith('.log')).filter(entry => entry.entryName != 'mission-report.log')
    logFilesEntries.forEach(entry => {
        const logContent = zip.readAsText(entry)
        const logHtmlContent = getHtmlLogContent(entry.entryName, logContent)
        const fileName: string = entry.entryName.split('.log')[0] + '.html'
        fs.writeFileSync(path.join(tempHtmlFolderPath, fileName), logHtmlContent)
    })

    openFile(tempHtmlPath)
}

function openFile(summaryPath: string) {
    const command: string = osType === OS.WINDOWS ? 'start' : 'open'
    exec(`${command} ${summaryPath}`, (err) => {
        if (err) {
            console.error('Error opening HTML file:', err)
            return
        }
        console.log('HTML file opened in the default browser.')
    })
}