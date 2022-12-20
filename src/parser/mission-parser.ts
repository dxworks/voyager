import {Mission} from '../model/Mission'
import {parseIntoMap} from './data-parser'
import {variableHandler} from '../variable/variable-handler'
import {CommandParametersProvider} from '../variable/command-parameters-provider'

const missionVariableProvider = new CommandParametersProvider()

export function parseMission(file: any): Mission {
    variableHandler.addCommandVariableProvider(missionVariableProvider)
    parseMissionInstruments(file.instruments)
    return {
        environment: parseIntoMap(file.environment), //TODO: remove this and manage global the environment variables
    }
}

function parseMissionInstruments(instrumentsObject: any): void {
    const instrumentsMap = parseIntoMap(instrumentsObject)
    instrumentsMap.forEach((value, key) => {
        parseMissionActions(value.actions, key)
    })
}

function parseMissionActions(actionsObject: any, instrumentName: string): void {
    const actionMap = parseIntoMap(actionsObject)
    actionMap.forEach((value, key) => {
        const actionName = key
        parseIntoMap(value.parameters).forEach((value, key) => {
            missionVariableProvider.setParameter(value, key, instrumentName, actionName)
        })
        parseMissionCommands(value.commands, instrumentName, actionName)
    })
}

function parseMissionCommands(commandsObject: any, instrumentName: string, actionName: string): void {
    const commandsMap = parseIntoMap(commandsObject)
    commandsMap.forEach((value, key) => {
        const commandName = key
        parseIntoMap(value.parameters).forEach((value, key) => {
            missionVariableProvider.setParameter(value, key, instrumentName, actionName, commandName)
        })
    })
}