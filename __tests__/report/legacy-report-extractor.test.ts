import {buildLegacyMissionSummary} from '../../src/report/legacy-report-extactor'

describe('legacy report extractor', () => {
    test('should parse mission name commands and elapsed time', () => {
        const content = [
            'Starting mission MyMission',
            'some other logs',
            '------------------- Mission Summary -------------------',
            '-------- ToolA --------',
            'Lint .... SUCCESS [ 0.4 s ]',
            'Test .... FAIL [ 0.8 s ]',
            '------ end ToolA ------',
            'Elapsed time: 1.2 s',
            '------------------- end Mission Summary -------------------',
            '_______________________container_______________________',
        ].join('\n')

        const summary = buildLegacyMissionSummary(content)

        expect(summary.missionName).toBe('MyMission')
        expect(summary.runningTime).toBe('1.2 s')
        const tool = summary.getInstrumentSummary('ToolA')
        expect(tool.commandsSummary.get('Lint')!.success).toBe(true)
        expect(tool.commandsSummary.get('Test')!.success).toBe(false)
    })

    test('should throw when summary block is missing', () => {
        const content = [
            'Starting mission Demo',
            '------------------- Mission Summary -------------------',
        ].join('\n')

        expect(() => buildLegacyMissionSummary(content)).toThrow('Summary text not found in the file.')
    })

    test('should return unknown running time when elapsed time is absent', () => {
        const content = [
            'Starting mission MyMission',
            '------------------- Mission Summary -------------------',
            '-------- ToolA --------',
            'Lint .... SUCCESS [ 0.4 s ]',
            '------ end ToolA ------',
            '------------------- end Mission Summary -------------------',
            '_______________________container_______________________',
        ].join('\n')

        const summary = buildLegacyMissionSummary(content)

        expect(summary.runningTime).toBe('????')
    })
})
