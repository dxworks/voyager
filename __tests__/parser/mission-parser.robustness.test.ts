import {missionContext} from '../../src/context/MissionContext'
import {parseMission} from '../../src/parser/mission-parser'
import {resetMissionContext} from '../utils/mission-context.utils'

describe('mission parser robustness', () => {
    beforeEach(() => {
        resetMissionContext()
    })

    afterEach(() => {
        resetMissionContext()
    })

    test('non-array targets should be ignored', () => {
        parseMission({targets: 'not-array'})

        expect(missionContext.targets).toEqual([])
    })

    test('runAll false with missing instruments should set empty runnable list', () => {
        missionContext.runAll = false

        parseMission({})

        expect(missionContext.runnableInstruments).toEqual([])
    })

    test('undefined mapping should keep unpack mapping empty', () => {
        parseMission({mapping: undefined})

        expect(missionContext.unpackMapping.isEmpty()).toBe(true)
    })
})
