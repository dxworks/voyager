import {Instrument} from '../model/Instrument'
import {parseIntoMap} from './data-parser'
import {Action, CustomAction, DefaultAction, Location, WithAction} from '../model/Action'
import {CommandContext} from '../model/Command'
import {VariableProvider} from '../variable/variable-provider'
import {
    getEnvironmentVariables,
    replaceMissionContextVariables,
    replaceParameters,
} from '../variable/variable-operations'
import {VariableHandler} from '../variable/variable-handler'
import {
    missionActionEnvVarProvider,
    missionActionVarProvider,
    missionCommandEnvVarProvider,
    missionCommandVarProvider,
    missionEnvVarProvider,
} from '../context/mission-providers'
import {isDefaultAction} from '../utils/ActionConstants'
import {missionContext} from '../context/mission-context'
import {INSTRUMENT_KEY} from '../context/context-variable-provider'

let variableHandler: VariableHandler
let actionVarProvider: VariableProvider
let commandVarProvider: VariableProvider
let commandEnvVarProvider: VariableProvider
let actionEnvVarProvider: VariableProvider

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function parseInstrument(file: any): Instrument {
    initVariableProvider()
    missionContext.addVariable(INSTRUMENT_KEY, file.name)
    const actions = parseInstrumentActions(file.actions, file.id)
    return {
        id: file.id,
        name: file.name,
        version: file.version,
        actions: actions,
    }
}

function parseInstrumentActions(actionObject: any, instrumentKey: string): Map<string, Action> {
    const actions: Map<string, Action> = new Map<string, Action>()
    parseIntoMap(actionObject).forEach((value, actionKey) => {
        if (isDefaultAction(actionKey)) {
            actions.set(actionKey, parseDefaultAction(value.with, actionKey))
        } else {
            parseIntoMap(value.parameters).forEach((value, variableKey) =>
                actionVarProvider.addVariables({instrumentKey, actionKey, variableKey, value}))
            parseIntoMap(value.environment).forEach((value, variableKey) =>
                actionEnvVarProvider.addVariables({instrumentKey, actionKey, variableKey, value}))
            actions.set(actionKey, parseCustomAction(value.commands, instrumentKey, actionKey))
        }
    })
    return actions
}

function parseCustomAction(commandsObject: any, instrumentKey: string, actionKey: string): CustomAction {
    const commands: CommandContext[] = []
    const commandsMap = parseIntoMap(commandsObject)
    commandsMap.forEach((value, commandKey) => {
        parseIntoMap(value.parameters).forEach((value, variableKey) =>
            commandVarProvider.addVariables({instrumentKey, actionKey, commandKey, variableKey, value}))
        parseIntoMap(value.environment).forEach((value, variableKey) =>
            commandEnvVarProvider.addVariables({instrumentKey, actionKey, commandKey, variableKey, value}))
        let commandType
        if (typeof value.command === 'string')
            commandType = replaceParameters(variableHandler, value.command, instrumentKey, actionKey, commandKey)
        else
            commandType = {
                windows: replaceParameters(variableHandler, value.command.windows, instrumentKey, actionKey, commandKey),
                unix: replaceParameters(variableHandler, value.command.unix, instrumentKey, actionKey, commandKey),
                mac: replaceParameters(variableHandler, value.command.mac, instrumentKey, actionKey, commandKey),
                linux: replaceParameters(variableHandler, value.command.linux, instrumentKey, actionKey, commandKey),
            }
        commands.push({
            id: commandKey,
            command: commandType,
            environment: getEnvironmentVariables(variableHandler, {instrumentKey, actionKey, commandKey}),
            with: parseWith(value.with),
        })
    })
    return {
        name: actionKey,
        commandsContext: commands,
    }
}

function parseDefaultAction(withObject: any, actionKey: string): DefaultAction {
    return {
        name: actionKey,
        with: parseWith(withObject),
    }
}

function parseWith(withObject: any): WithAction {
    return {
        validExitCodes: withObject?.validExitCodes,
        script: withObject?.script,
        locations: parseLocations(withObject?.locations),
    }
}

function parseLocations(locationsObject: any): Location[] {
    const locations: Location[] = []
    parseIntoMap(locationsObject).forEach(value => {
        locations.push(parseLocation(value))
    })
    return locations
}

function parseLocation(locationObject: any): Location {
    return {
        source: replaceMissionContextVariables(locationObject.source),
        destination: locationObject.destination,
        files: locationObject.files,
    }
}


function initVariableProvider(): void {
    variableHandler = new VariableHandler()
    commandVarProvider = new VariableProvider()
    actionVarProvider = new VariableProvider()
    commandEnvVarProvider = new VariableProvider()
    actionEnvVarProvider = new VariableProvider()
    variableHandler.addParametersProvider(missionCommandVarProvider, missionActionVarProvider, commandVarProvider, actionVarProvider)
    variableHandler.addEnvironmentVariablesProviders(missionCommandEnvVarProvider, missionActionEnvVarProvider, missionEnvVarProvider, commandEnvVarProvider, actionEnvVarProvider)
}