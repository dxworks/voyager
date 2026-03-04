import {MissionContext, missionContext} from '../../src/context/MissionContext'
import {RESULTS_UNPACK_DIR, RESULTS_ZIP_DIR} from '../../src/context/context-variable-provider'
import {resetMissionContext} from '../utils/mission-context.utils'

describe('MissionContext', () => {
    beforeEach(() => {
        resetMissionContext()
    })

    afterEach(() => {
        resetMissionContext()
    })

    test('getInstance should return same singleton instance', () => {
        const first = MissionContext.getInstance()
        const second = MissionContext.getInstance()

        expect(first).toBe(second)
        expect(first).toBe(missionContext)
    })

    test('setting name should set mission summary and default result paths', () => {
        missionContext.name = 'sample'

        expect(missionContext.missionSummary.missionName).toBe('sample')
        expect(missionContext.getVariable(RESULTS_ZIP_DIR)).toBe('./sample-voyager-results.zip')
        expect(missionContext.getVariable(RESULTS_UNPACK_DIR)).toBe('./sample-voyager-results')
    })

    test('addVariable and getVariable should return stored values', () => {
        missionContext.addVariable('k1', 'v1')

        expect(missionContext.getVariable('k1')).toBe('v1')
        expect(missionContext.getVariable('missing')).toBe(null)
    })

    test('missionNameInZipFile getter and setter should persist value', () => {
        missionContext.missionNameInZipFile = true

        expect(missionContext.missionNameInZipFile).toBe(true)
    })
})
