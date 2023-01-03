import {VariableHandler} from '../../src/variable/variable-handler'
import {VariableProvider} from '../../src/variable/variable-provider'
import {
    instrumentActionEnvProvider,
    instrumentCommandEnvProvider,
    missionActionEnvProvider,
    missionCommandEnvProvider,
    missionEnvProvider,
} from './environment-variables.utils'
import {
    instrumentActionParameterProvider,
    instrumentCommandParameterProvider,
    missionActionParameterProvider,
    missionCommandParameterProvider,
} from './parameters-variables.utils'


export function mapsAreEqual(m1: Map<string, string>, m2: Map<string, string>): boolean {
    return m1.size === m2.size && Array.from(m1.keys()).every((key) => m1.get(key) === m2.get(key))
}

export function getDefaultVariableHandler(): VariableHandler {
    const variableHandler = new VariableHandler()
    variableHandler.addParametersProvider(missionCommandParameterProvider, missionActionParameterProvider, instrumentCommandParameterProvider, instrumentActionParameterProvider)
    variableHandler.addEnvironmentVariablesProviders(missionCommandEnvProvider, missionActionEnvProvider, missionEnvProvider, instrumentCommandEnvProvider, instrumentActionEnvProvider)
    return variableHandler
}

export function getCustomEnvHandler(...environmentProviders: VariableProvider[]): VariableHandler {
    const variableHandler = new VariableHandler()
    if (environmentProviders)
        variableHandler.addEnvironmentVariablesProviders(...environmentProviders)
    return variableHandler
}

export function getCustomParametersHandler(...parameterProviders: VariableProvider[]): VariableHandler {
    const variableHandler = new VariableHandler()
    if (parameterProviders)
        variableHandler.addParametersProvider(...parameterProviders)
    return variableHandler
}
