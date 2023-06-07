import {missionContext} from '../../context/MissionContext'
import {getCommandSummaryHtml, getInstrumentSummaryHtml, getMissionSummaryHtml} from './html-report-utils'
import fs from 'fs'
import path from 'node:path'

export function getHtmlReportPath(): string {
    return path.join(<string>missionContext.getVariable('firstWorkingDir'), 'MissionReport.html')
}

export function getHtmlLogContent(logs: string): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
</head>
<body>
<pre>
${logs}
</pre>
</body>
</html>`
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