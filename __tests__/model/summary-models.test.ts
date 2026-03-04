import {CommandSummary} from '../../src/model/summary/CommandSummary'
import {InstrumentSummary} from '../../src/model/summary/InstrumentSummary'
import {MissionSummary} from '../../src/model/summary/MissionSummary'

describe('summary models', () => {
    test('CommandSummary getters and setters should persist values', () => {
        const commandSummary = new CommandSummary()

        commandSummary.runningTime = '0.4s'
        commandSummary.success = false

        expect(commandSummary.runningTime).toBe('0.4s')
        expect(commandSummary.success).toBe(false)
    })

    test('InstrumentSummary should store command summaries', () => {
        const instrumentSummary = new InstrumentSummary()
        const commandSummary = new CommandSummary()
        commandSummary.runningTime = '0.5s'

        instrumentSummary.runningTime = '1.0s'
        instrumentSummary.addCommandSummary('lint', commandSummary)

        expect(instrumentSummary.runningTime).toBe('1.0s')
        expect(instrumentSummary.commandsSummary.get('lint')!.runningTime).toBe('0.5s')
    })

    test('MissionSummary should store instrument summaries', () => {
        const missionSummary = new MissionSummary()
        const instrumentSummary = new InstrumentSummary()

        missionSummary.missionName = 'Demo'
        missionSummary.runningTime = '2.0s'
        missionSummary.addInstrumentSummary('ToolA', instrumentSummary)

        expect(missionSummary.missionName).toBe('Demo')
        expect(missionSummary.runningTime).toBe('2.0s')
        expect(missionSummary.getInstrumentSummary('ToolA')).toBe(instrumentSummary)
    })
})
