import {missionContext} from '../../context/MissionContext'
import {getCommandSummaryHtml, getInstrumentSummaryHtml, getMissionSummaryHtml} from './html-report-utils'
import fs from 'fs'
import path from 'node:path'
import {MISSION_RESULT_ARCHIVE_NAME, VOYAGER_WORKING_DIR} from '../../context/context-variable-provider'
import {MissionSummary} from '../../model/summary/MissionSummary'

export function getHtmlReportPath(): string {
    return path.join(<string>missionContext.getVariable(VOYAGER_WORKING_DIR), MISSION_RESULT_ARCHIVE_NAME)
}

export function generateHtmlReport(missionSummary: MissionSummary): string {
    const htmReportPath = getHtmlReportPath()
    fs.writeFileSync(htmReportPath, generateHtmlReportContent(missionSummary), {flag: 'w'})
    return htmReportPath
}

export function generateHtmlReportContent(missionSummary: MissionSummary): string {
    let summaryContent = ''
    missionSummary.instrumentsSummary.forEach((instrumentSummary, instrumentName) => {
        const numberOfCommands = instrumentSummary.commandsSummary.size
        let isFirstCommand = true
        instrumentSummary.commandsSummary.forEach((commandSummary, commandName) => {
            const successStatus = commandSummary.success ? 'SUCCESS' : 'FAIL'
            if (isFirstCommand) {
                summaryContent += getInstrumentSummaryHtml(instrumentName, numberOfCommands, commandName, successStatus, commandSummary.runningTime)
                isFirstCommand = false
            } else
                summaryContent += getCommandSummaryHtml(commandName, successStatus, commandSummary.runningTime)
        })
    })
    return getMissionSummaryHtml(missionSummary.missionName, missionSummary.runningTime, summaryContent)
}