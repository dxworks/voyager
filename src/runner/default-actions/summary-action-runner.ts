import fs from 'fs'
import path from 'node:path'
import {DefaultAction} from '../../model/Action'
import {runCommand} from '../command-runner'
import {missionContext} from '../../context/MissionContext'

interface SummaryActionResult {
    summaryMdFilePath: string | null
    summaryHtmlFilePath: string | null
}

export async function runSummaryAction(
    action: DefaultAction,
    instrumentPath: string,
    instrumentName: string
): Promise<SummaryActionResult> {
    const summaryMdFilePath = action.summaryMdFile
        ? path.resolve(instrumentPath, action.summaryMdFile)
        : null
    const summaryHtmlFilePath = action.summaryHtmlFile
        ? path.resolve(instrumentPath, action.summaryHtmlFile)
        : null
    const expectedSummaryFiles = [summaryMdFilePath, summaryHtmlFilePath].filter((filePath): filePath is string => filePath !== null)

    if (expectedSummaryFiles.length > 0 && expectedSummaryFiles.every(filePath => fs.existsSync(filePath))) {
        updateSummaryVariables(instrumentName, summaryMdFilePath, summaryHtmlFilePath)
        return {
            summaryMdFilePath,
            summaryHtmlFilePath,
        }
    }

    if (action.commandsContext && action.commandsContext.length > 0) {
        for (const commandContext of action.commandsContext) {
            await runCommand(commandContext, commandContext.dir ?? instrumentPath, instrumentName)
        }
    }

    if (summaryMdFilePath && !fs.existsSync(summaryMdFilePath))
        console.warn(`Instrument ${instrumentName}: summary markdown file not found at ${summaryMdFilePath}`)

    if (summaryHtmlFilePath && !fs.existsSync(summaryHtmlFilePath))
        console.warn(`Instrument ${instrumentName}: summary HTML file not found at ${summaryHtmlFilePath}`)

    updateSummaryVariables(instrumentName, summaryMdFilePath, summaryHtmlFilePath)

    return {
        summaryMdFilePath: summaryMdFilePath && fs.existsSync(summaryMdFilePath) ? summaryMdFilePath : null,
        summaryHtmlFilePath: summaryHtmlFilePath && fs.existsSync(summaryHtmlFilePath) ? summaryHtmlFilePath : null,
    }
}

function updateSummaryVariables(instrumentName: string, summaryMdFilePath: string | null, summaryHtmlFilePath: string | null): void {
    missionContext.addVariable(
        `${instrumentName}SummaryMd`,
        summaryMdFilePath && fs.existsSync(summaryMdFilePath) ? summaryMdFilePath : 'null'
    )
    missionContext.addVariable(
        `${instrumentName}SummaryHtml`,
        summaryHtmlFilePath && fs.existsSync(summaryHtmlFilePath) ? summaryHtmlFilePath : 'null'
    )
}
