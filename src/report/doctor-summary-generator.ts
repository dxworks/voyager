import {DoctorReport} from './DoctorReport'
import {centerText, padLine} from './mission-summary-generator'
import {missionContext} from '../context/MissionContext'

export function generateDoctorReportLogs(doctorReport: DoctorReport): void{
    const maxLength = 100
    const missionNameLine = ` ${missionContext.name} Doctor Report `
    const centeredMissionNameLine = centerText(missionNameLine, maxLength)
    let output = centeredMissionNameLine + '\n'
    
    doctorReport.instrumentsDoctorReport.forEach(instrumentReport => {
        output += padLine(instrumentReport.instrumentName, '', maxLength) + '\n'
        instrumentReport.requirementsByName.forEach((requirementState, requirementName) => {
            const successState = requirementState? 'PASSED': 'FAILED'
            output += padLine(requirementName, successState, maxLength, true) + '\n'
        })
    })

    console.log(output)
}