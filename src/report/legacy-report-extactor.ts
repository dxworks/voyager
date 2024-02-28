import {MissionSummary} from '../model/summary/MissionSummary'
import {InstrumentSummary} from '../model/summary/InstrumentSummary'
import {CommandSummary} from '../model/summary/CommandSummary'

const MISSION_SUMMARY_HEADER = '------------------- Mission Summary -------------------'
const MISSION_SUMMARY_FOOTER = '_______________________container_______________________'

export function buildLegacyMissionSummary(missionReportContent: string): MissionSummary {
    const missionSummary = new MissionSummary()
    missionSummary.missionName = extractMissionName(missionReportContent)
    const summaryText = extractSummaryText(missionReportContent)
    missionSummary.instrumentsSummary = extractInstrumentsSummary(summaryText)
    missionSummary.runningTime = extractMissionRunningTime(missionReportContent)
    return missionSummary
}

function extractMissionName(fileContent: string): string {
    const firstLine = fileContent.split('\n')[0]
    const startIndex = firstLine.indexOf('Starting mission') + 'Starting mission'.length
    return firstLine.substring(startIndex).trim()
}

function extractSummaryText(fileContent: string): string {
    const text = fileContent.split(MISSION_SUMMARY_HEADER)
    let summaryText = text[text.length - 1]
    summaryText = summaryText.split(MISSION_SUMMARY_FOOTER)[0]
    if (!summaryText) {
        throw new Error('Summary text not found in the file.')
    }
    return summaryText
}

function extractInstrumentsSummary(summaryText: string): Map<string, InstrumentSummary> {
    const instrumentsSummary = new Map<string, InstrumentSummary>()
    const instrumentsText = summaryText.split(/(?=------ end)/)
    instrumentsText.forEach(instrumentText => {
        const instrumentName = extractInstrumentName(instrumentText)
        const instrumentSummary = new InstrumentSummary()
        instrumentSummary.commandsSummary = extractCommandsSummary(instrumentText)
        instrumentsSummary.set(instrumentName, instrumentSummary)
    })
    return instrumentsSummary
}

function extractInstrumentName(instrumentText: string): string {
    const match = instrumentText.match(/-{8}\s*(.*?)\s*-{8}/)
    return match ? match[1] : ''
}

function extractCommandsSummary(instrumentText: string): Map<string, CommandSummary> {
    const commandsSummary = new Map<string, CommandSummary>()
    const pattern = /([\w\s]+) \.\.\.+ (SUCCESS|FAIL)\s+\[\s+([\d.]+)\s+s\s+]/g
    const matches = instrumentText.matchAll(pattern)
    for (const match of matches) {
        const name = match[1].trim()
        const commandSummary = new CommandSummary()
        commandSummary.success = match[2].toLowerCase() === 'success'
        commandSummary.runningTime = match[3] + ' s'
        commandsSummary.set(name, commandSummary)
    }

    return commandsSummary
}

function extractMissionRunningTime(fileContent: string): string {
    const regex = /Elapsed time: ([\d.]+) s(?![\s\S]*Elapsed time)(?=[\s\S]*-+ end Mission Summary -+)/
    const match = fileContent.match(regex)
    return match ? match[1] + ' s' : '????'
}
