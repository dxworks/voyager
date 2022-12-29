import {VariableHandler} from '../../src/variable/variable-handler'
import {ParametersProvider} from '../../src/variable/parameters-provider'
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

const variableHandler = VariableHandler.getInstance()

export function getDefaultVariableHandler(): VariableHandler {
    variableHandler.addParametersProvider(missionCommandParameterProvider, missionActionParameterProvider, instrumentCommandParameterProvider, instrumentActionParameterProvider)
    variableHandler.addEnvironmentVariablesProviders(missionCommandEnvProvider, missionActionEnvProvider, missionEnvProvider, instrumentCommandEnvProvider, instrumentActionEnvProvider)
    return variableHandler
}

export function getCustomEnvHandler(...environmentProviders: ParametersProvider[]): VariableHandler {
    if (environmentProviders)
        variableHandler.addEnvironmentVariablesProviders(...environmentProviders)
    return variableHandler
}

export function getCustomParametersHandler(...parameterProviders: ParametersProvider[]): VariableHandler {
    if (parameterProviders)
        variableHandler.addParametersProvider(...parameterProviders)
    return variableHandler
}

export function cleanVariableHandler(): void {
    variableHandler.popEnvironmentVariablesProvider(5)
    variableHandler.popParameterProvider(4)
}