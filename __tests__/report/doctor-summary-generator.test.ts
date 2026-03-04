import {InstrumentDoctorReport} from '../../src/model/DoctorReport'
import {missionContext} from '../../src/context/MissionContext'
import {generateDoctorReportLogs} from '../../src/report/doctor-summary-generator'
import {resetMissionContext} from '../utils/mission-context.utils'

describe('doctor summary generator', () => {
    beforeEach(() => {
        resetMissionContext()
    })

    afterEach(() => {
        resetMissionContext()
        jest.restoreAllMocks()
    })

    test('generateDoctorReportLogs should print passed and failed requirements', () => {
        missionContext.name = 'DemoMission'
        const report = new InstrumentDoctorReport('ToolA')
        report.requirementsByName.set('node', true)
        report.requirementsByName.set('java', false)
        missionContext.doctorReport.addInstrumentDoctorReport(report)
        const logSpy = jest.spyOn(console, 'log').mockImplementation()

        generateDoctorReportLogs()

        const output = logSpy.mock.calls[0][0]
        expect(output).toContain('DemoMission Doctor Report')
        expect(output).toContain('ToolA')
        expect(output).toContain('node')
        expect(output).toContain('PASSED')
        expect(output).toContain('FAILED')
    })
})
