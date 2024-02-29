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
import {REPO, REPO_NAME, TARGET} from '../context/context-variable-provider'

export function parseMission(file: any): void {
    if (file.target) {
        const targetPath = path.normalize(file.target)
        missionContext.addVariable(TARGET, targetPath)
        missionContext.addVariable(REPO, targetPath)
        missionContext.addVariable(REPO_NAME, path.basename(targetPath))
    }
    missionContext.missionNameInZipFile = file.missionNameInZipFile
    parseIntoMap(file.environment).forEach((value, variableKey) =>
        missionEnvVarProvider.addVariables({variableKey, value}))
    parseMissionTargets(file.targets)
    parseMissionMapping(file.mapping)
    const instruments = parseMissionInstruments(file.instruments)
    if (!missionContext.runAll)
        missionContext.runnableInstruments = instruments
}

function parseMissionTargets(targetsObject: any): void {
    const targets: string[] = []
    const targetsMap = parseIntoMap(targetsObject)
    targetsMap.forEach((value) => {
        targets.push(value)
    })
    missionContext.targets = targets
}

function parseMissionMapping(mappingObject: any): void {
    const mappingMap = parseIntoMap(mappingObject)
    mappingMap.forEach((value, instrumentKey) => {
        const instrumentMapping = parseIntoMap(value)
        instrumentMapping.forEach((value) => {
            missionContext.unpackMapping.addMappingElement(instrumentKey, value.source, value.destination, value.prefix)
        })
    })
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