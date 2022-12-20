import {parseIntoMap} from './data-parser'
import {variableHandler} from '../variable/variable-handler'
import {CommandParametersProvider} from '../variable/command-parameters-provider'
import {missionContext} from '../context/mission-context'

const missionVariableProvider = new CommandParametersProvider()

export function parseMission(file: any): void {
    variableHandler.addCommandVariableProvider(missionVariableProvider)
    const instruments = parseMissionInstruments(file.instruments)
    if (!missionContext.runAll) {
        missionContext.setRunnableInstruments(instruments)
    }
    // return {
    //     environment: parseIntoMap(file.environment), //TODO: remove this and manage global the environment variables
    // }
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