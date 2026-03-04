import {DoctorReport, InstrumentDoctorReport} from '../../src/model/DoctorReport'

describe('doctor report model', () => {
    test('addInstrumentDoctorReport should append new report', () => {
        const report = new DoctorReport()
        const instrumentReport = new InstrumentDoctorReport('ToolA')

        report.addInstrumentDoctorReport(instrumentReport)

        expect(report.instrumentsDoctorReport.length).toBe(1)
        expect(report.instrumentsDoctorReport[0].instrumentName).toBe('ToolA')
    })

    test('InstrumentDoctorReport should expose mutable name and requirements map', () => {
        const instrumentReport = new InstrumentDoctorReport('ToolA')

        instrumentReport.instrumentName = 'ToolB'
        instrumentReport.requirementsByName.set('node', true)

        expect(instrumentReport.instrumentName).toBe('ToolB')
        expect(instrumentReport.requirementsByName.get('node')).toBe(true)
    })
})
