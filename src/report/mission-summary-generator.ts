import {missionContext} from '../context/MissionContext'

export function generateMissionSummary(): void {
    const missionSummary = missionContext.missionSummary
    const maxLength = 100
    const missionNameLine = ` ${missionSummary.missionName} Summary `
    const centeredMissionNameLine = centerText(missionNameLine, maxLength)
    let output = centeredMissionNameLine + '\n'

    missionSummary.instrumentsSummary.forEach((instrumentSummary, instrumentName) => {
        output += padLine(instrumentName, `[ ${instrumentSummary.runningTime} ]`, maxLength) + '\n'
        instrumentSummary.commandsSummary.forEach((commandSummary, commandName) => {
            const successStatus = commandSummary.success ? 'SUCCESS' : 'FAIL'
            output += padLine(commandName, `${successStatus} [ ${commandSummary.runningTime} ]`, maxLength, true) + '\n'
        })
    })
    output += padLine('Elapsed Time', ` [ ${missionSummary.runningTime} ]`, maxLength)
    console.log(output)
}

export function centerText(text: string, maxLength: number): string {
    const padding = '.'.repeat(Math.floor((maxLength - text.length) / 2))
    return padding + text + padding
}

export function padLine(startLine: string, endLine: string, maxLength: number, frontTab?: boolean): string {
    if (frontTab)
        startLine = '    ' + startLine
    const remainingSpace = maxLength - (startLine.length + endLine.length)
    const points = '.'.repeat(remainingSpace)
    return startLine + points + endLine
}