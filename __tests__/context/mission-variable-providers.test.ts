import {
    missionActionEnvVarProvider,
    missionActionVarProvider,
    missionCommandEnvVarProvider,
    missionCommandVarProvider,
    missionEnvVarProvider,
} from '../../src/context/mission-variable-providers'
import {resetMissionContext} from '../utils/mission-context.utils'

describe('mission variable providers', () => {
    beforeEach(() => {
        resetMissionContext()
    })

    afterEach(() => {
        resetMissionContext()
    })

    test('providers should be defined and independent', () => {
        missionCommandVarProvider.addVariables({variableKey: 'threads', value: '8'})
        missionActionVarProvider.addVariables({variableKey: 'heap', value: '2g'})
        missionCommandEnvVarProvider.addVariables({variableKey: 'DEBUG', value: '1'})
        missionActionEnvVarProvider.addVariables({variableKey: 'TOKEN', value: 'abc'})
        missionEnvVarProvider.addVariables({variableKey: 'JAVA_HOME', value: '/jdk'})

        expect(missionCommandVarProvider.getVariables().length).toBe(1)
        expect(missionActionVarProvider.getVariables().length).toBe(1)
        expect(missionCommandEnvVarProvider.getVariables().length).toBe(1)
        expect(missionActionEnvVarProvider.getVariables().length).toBe(1)
        expect(missionEnvVarProvider.getVariables().length).toBe(1)
        expect(missionCommandVarProvider.getVariables()[0].variableKey).toBe('threads')
        expect(missionActionVarProvider.getVariables()[0].variableKey).toBe('heap')
    })
})
