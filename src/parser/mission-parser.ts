import {parseIntoMap} from './data-parser'
import {variableHandler} from '../variable/variable-handler'
import {ParametersProvider} from '../variable/parameters-provider'
import {missionContext} from '../context/mission-context'

const commandVarProvider = new ParametersProvider()
const actionVarProvider = new ParametersProvider()
const commandEnvVarProvider = new ParametersProvider()
const actionEnvVarProvider = new ParametersProvider()
const missionEnvVarProvider = new ParametersProvider()

export function parseMission(file: any): void {
    variableHandler.addParametersProvider(commandVarProvider, actionVarProvider)
    variableHandler.addEnvironmentVariablesProviders(commandEnvVarProvider, actionEnvVarProvider, missionEnvVarProvider)
    parseIntoMap(file.environment).forEach((value, variableKey) =>
        missionEnvVarProvider.addVariables({variableKey, value}))
    const instruments = parseMissionInstruments(file.instruments)
    if (!missionContext.runAll) {
        missionContext.runnableInstruments = instruments
    }
}

function parseMissionInstruments(instrumentsObject: any): string[] {
    const instruments: string[] = []
    const instrumentsMap = parseIntoMap(instrumentsObject)
    instrumentsMap.forEach((value, instrumentId) => {
        parseMissionActions(value.actions, instrumentId)
        instruments.push(instrumentId)
    })
    return instruments
}

function parseMissionActions(actionsObject: any, instrumentKey: string): void {
    const actionMap = parseIntoMap(actionsObject)
    actionMap.forEach((value, key) => {
        const actionKey = key
        parseIntoMap(value.parameters).forEach((value, variableKey) =>
            actionVarProvider.addVariables({instrumentKey, actionKey, variableKey, value}))
        parseIntoMap(value.environment).forEach((value, variableKey) =>
            actionEnvVarProvider.addVariables({instrumentKey, actionKey, variableKey, value}))
        parseMissionCommands(value.commands, instrumentKey, actionKey)
    })
}

function parseMissionCommands(commandsObject: any, instrumentKey: string, actionKey: string): void {
    const commandsMap = parseIntoMap(commandsObject)
    commandsMap.forEach((value, key) => {
        const commandKey = key
        parseIntoMap(value.parameters).forEach((value, variableKey) =>
            commandVarProvider.addVariables({instrumentKey, actionKey, commandKey, variableKey, value}))
        parseIntoMap(value.environment).forEach((value, variableKey) =>
            commandEnvVarProvider.addVariables({instrumentKey, actionKey, commandKey, variableKey, value}))
    })
}