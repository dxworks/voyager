import {parseIntoMap} from './data-parser'
import {missionContext} from '../context/MissionContext'
import {
    missionActionEnvVarProvider,
    missionActionVarProvider,
    missionCommandEnvVarProvider,
    missionCommandVarProvider,
    missionEnvVarProvider,
} from '../context/mission-variable-providers'
import path from 'node:path'

export function parseMission(file: any): void {
    const targetPath = path.normalize(file.target)
    missionContext.addVariable('repo', targetPath)
    missionContext.addVariable('repoName', path.basename(targetPath))
    parseIntoMap(file.environment).forEach((value, variableKey) =>
        missionEnvVarProvider.addVariables({variableKey, value}))
    const instruments = parseMissionInstruments(file.instruments)
    if (!missionContext.runAll)
        missionContext.runnableInstruments = instruments
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
            missionActionVarProvider.addVariables({instrumentKey, actionKey, variableKey, value}))
        parseIntoMap(value.environment).forEach((value, variableKey) =>
            missionActionEnvVarProvider.addVariables({instrumentKey, actionKey, variableKey, value}))
        parseMissionCommands(value.commands, instrumentKey, actionKey)
    })
}

function parseMissionCommands(commandsObject: any, instrumentKey: string, actionKey: string): void {
    const commandsMap = parseIntoMap(commandsObject)
    commandsMap.forEach((value, key) => {
        const commandKey = key
        parseIntoMap(value.parameters).forEach((value, variableKey) =>
            missionCommandVarProvider.addVariables({instrumentKey, actionKey, commandKey, variableKey, value}))
        parseIntoMap(value.environment).forEach((value, variableKey) =>
            missionCommandEnvVarProvider.addVariables({instrumentKey, actionKey, commandKey, variableKey, value}))
    })
}