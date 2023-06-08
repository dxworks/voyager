import {missionContext} from '../../context/MissionContext'
import {getCommandSummaryHtml, getInstrumentSummaryHtml, getMissionSummaryHtml} from './html-report-utils'
import fs from 'fs'
import path from 'node:path'
import {VOYAGER_WORKING_DIR} from '../../context/context-variable-provider'

export function getHtmlReportPath(): string {
    return path.join(<string>missionContext.getVariable(VOYAGER_WORKING_DIR), 'MissionReport.html')
}

export function generateHtmlReport(): string {
    const missionSummary = missionContext.missionSummary
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
    const missionSummaryContent = getMissionSummaryHtml(missionSummary.missionName, missionSummary.runningTime, summaryContent)
    const htmReportPath = getHtmlReportPath()
    fs.writeFileSync(htmReportPath, missionSummaryContent, {flag: 'w'})
    return htmReportPath
}