import {VariableHandler} from '../../src/variable/variable-handler'
import {ParametersProvider} from '../../src/variable/parameters-provider'

export function mapsAreEqual(m1: Map<string, string>, m2: Map<string, string>): boolean {
    return m1.size === m2.size && Array.from(m1.keys()).every((key) => m1.get(key) === m2.get(key))
}

const variableHandler = VariableHandler.getInstance()

export const missionCommandProvider = new ParametersProvider([{
    instrumentKey: 'test',
    actionKey: 'custom',
    commandKey: 'hello',
    variableKey: 'test',
    value: '10',
}, {
    instrumentKey: 'test',
    actionKey: 'custom',
    commandKey: 'hello',
    variableKey: 'missionCommand',
    value: '10',
}])

export const missionActionProvider = new ParametersProvider([{
    instrumentKey: 'test',
    actionKey: 'custom',
    variableKey: 'test',
    value: '9',
}, {instrumentKey: 'test', actionKey: 'custom', variableKey: 'missionAction', value: '9'}])

export const missionProvider = new ParametersProvider([{variableKey: 'test', value: '9'}, {
    variableKey: 'mission',
    value: '8',
}])

export const instrumentCommandProvider = new ParametersProvider([{
    instrumentKey: 'test',
    actionKey: 'custom',
    commandKey: 'hello',
    variableKey: 'test',
    value: '7',
}, {
    instrumentKey: 'test',
    actionKey: 'custom',
    commandKey: 'hello',
    variableKey: 'instrumentCommand',
    value: '7',
}])

export const instrumentActionProvider = new ParametersProvider([{
    instrumentKey: 'test',
    actionKey: 'custom',
    variableKey: 'test',
    value: '6',
}, {instrumentKey: 'test', actionKey: 'custom', variableKey: 'instrumentAction', value: '6'}])

export function getDefaultVariableHandler(): VariableHandler {
    variableHandler.addEnvironmentVariablesProviders(missionCommandProvider, missionActionProvider, missionProvider, instrumentCommandProvider, instrumentActionProvider)
    return variableHandler
}

export function getCustomHandler(...environmentProviders: ParametersProvider[]): VariableHandler{
    if(environmentProviders)
        variableHandler.addEnvironmentVariablesProviders(...environmentProviders)
    return variableHandler
}

export function cleanVariableHandler(): void {
    variableHandler.popEnvironmentVariablesProvider(5)
}