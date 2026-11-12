import {missionContext} from '../../src/context/MissionContext'
import {CommandSummary} from '../../src/model/summary/CommandSummary'
import {InstrumentSummary} from '../../src/model/summary/InstrumentSummary'
import {centerText, generateMissionSummary, hasFailedCommand, logInstrumentsResult, padLine} from '../../src/report/mission-summary-generator'
import {resetMissionContext} from '../utils/mission-context.utils'

describe('mission summary generator', () => {
    beforeEach(() => {
        resetMissionContext()
    })

    afterEach(() => {
        resetMissionContext()
        jest.restoreAllMocks()
    })

    test('generateMissionSummary should print mission instruments commands and elapsed time', () => {
        missionContext.missionSummary.missionName = 'DemoMission'
        missionContext.missionSummary.runningTime = '1.2s'
        const instrumentSummary = new InstrumentSummary()
        instrumentSummary.runningTime = '0.9s'
        const commandSummary = new CommandSummary()
        commandSummary.success = true
        commandSummary.runningTime = '0.9s'
        instrumentSummary.addCommandSummary('run', commandSummary)
        missionContext.missionSummary.addInstrumentSummary('ToolA', instrumentSummary)
        const logSpy = jest.spyOn(console, 'log').mockImplementation()

        generateMissionSummary()

        const output = logSpy.mock.calls[0][0]
        expect(output).toContain('DemoMission Summary')
        expect(output).toContain('ToolA')
        expect(output).toContain('SUCCESS')
        expect(output).toContain('Elapsed Time')
    })

    test('logInstrumentsResult should list the succeeded and the failed instruments', () => {
        const logSpy = jest.spyOn(console, 'log').mockImplementation()

        logInstrumentsResult(['ToolA', 'ToolB', 'ToolC'], ['ToolB'])

        expect(logSpy.mock.calls[0][0]).toBe('Instruments succeeded (2): ToolA, ToolC')
        expect(logSpy.mock.calls[1][0]).toBe('Instruments failed (1): ToolB')
    })

    test('logInstrumentsResult should say none when no instrument failed', () => {
        const logSpy = jest.spyOn(console, 'log').mockImplementation()

        logInstrumentsResult(['ToolA'], [])

        expect(logSpy.mock.calls[1][0]).toBe('Instruments failed (0): none')
    })

    test('hasFailedCommand should be true only when a command failed', () => {
        const instrumentSummary = new InstrumentSummary()
        instrumentSummary.addCommandSummary('ok', new CommandSummary())
        expect(hasFailedCommand(instrumentSummary)).toBe(false)

        const failedCommand = new CommandSummary()
        failedCommand.success = false
        instrumentSummary.addCommandSummary('failed', failedCommand)
        expect(hasFailedCommand(instrumentSummary)).toBe(true)
    })

    test('padLine should prepend indentation when frontTab is true', () => {
        const line = padLine('Run', 'SUCCESS', 20, true)

        expect(line.startsWith('    Run')).toBe(true)
    })

    test('centerText should include original text in output', () => {
        const centered = centerText(' title ', 20, '.')

        expect(centered).toContain(' title ')
    })
})
