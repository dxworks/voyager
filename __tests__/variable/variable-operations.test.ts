import {missionContext} from '../../src/context/MissionContext'
import {replaceMissionContextVariables, replaceParameters, replaceRegex} from '../../src/variable/variable-operations'
import {VariableHandler} from '../../src/variable/VariableHandler'
import {VariableProvider} from '../../src/variable/VariableProvider'
import {resetMissionContext} from '../utils/mission-context.utils'

describe('variable operations', () => {
    beforeEach(() => {
        resetMissionContext()
        missionContext.addVariable('repo', 'voyager')
        missionContext.addVariable('branch', 'main')
    })

    afterEach(() => {
        resetMissionContext()
    })

    test('replaceMissionContextVariables should replace known placeholders', () => {
        const result = replaceMissionContextVariables('repo=${repo}, branch=${branch}')

        expect(result).toBe('repo=voyager, branch=main')
    })

    test('replaceMissionContextVariables should keep unknown placeholders', () => {
        const result = replaceMissionContextVariables('value=${unknown}')

        expect(result).toBe('value=${unknown}')
    })

    test('replaceRegex should replace repeated placeholders until regex state stops matching', () => {
        const result = replaceRegex('${x}-${x}-${x}', () => '1')

        expect(result).toBe('1-1-${x}')
    })

    test('replaceParameters should replace mission variables first and then parameter variables', () => {
        const variableHandler = new VariableHandler()
        const parameterProvider = new VariableProvider([
            {
                instrumentKey: 'tool',
                actionKey: 'start',
                commandKey: 'cmd',
                variableKey: 'threads',
                value: '8',
            },
        ])
        variableHandler.addParametersProvider(parameterProvider)

        const result = replaceParameters(variableHandler, '${repo}-${threads}', 'tool', 'start', 'cmd')

        expect(result).toBe('voyager-8')
    })
})
