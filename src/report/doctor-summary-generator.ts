import {centerText, maxLength, padLine} from './mission-summary-generator'
import {missionContext} from '../context/MissionContext'

export function generateDoctorReportLogs(): void {
    const missionNameLine = ` ${missionContext.name} Doctor Report `
    const centeredMissionNameLine = centerText(missionNameLine, maxLength, '.')
    let output = centeredMissionNameLine + '\n'

    missionContext.doctorReport.instrumentsDoctorReport.forEach(instrumentReport => {
        output += padLine(instrumentReport.instrumentName, '', maxLength) + '\n'
        instrumentReport.requirementsByName.forEach((requirementState, requirementName) => {
            const successState = requirementState ? 'PASSED' : 'FAILED'
            output += padLine(requirementName, successState, maxLength, true) + '\n'
        })
    })

    console.log(output)
}