import {Instrument} from '../model/Instrument'
import {parseIntoMap} from './data-parser'
import {Action} from '../model/Action'
import {CommandContext, WithActions} from '../model/Command'
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

let variableHandler: VariableHandler
let actionVarProvider: VariableProvider
let commandVarProvider: VariableProvider
let commandEnvVarProvider: VariableProvider
let actionEnvVarProvider: VariableProvider

export function parseInstrument(file: any): Instrument {
    initVariableProvider()
    const actions = parseInstrumentActions(file.actions, file.id)
    return {
        id: file.id,
        name: file.name,
        version: file.version,
        actions: actions,
        produces: parseProduces(file.produces),
    }
}

function parseInstrumentActions(actionObject: any, instrumentKey: string): Action[] {
    const actions: Action[] = []
    parseIntoMap(actionObject).forEach((value, actionKey) => {
        parseIntoMap(value.parameters).forEach((value, variableKey) =>
            actionVarProvider.addVariables({instrumentKey, actionKey, variableKey, value}))
        parseIntoMap(value.environment).forEach((value, variableKey) =>
            actionEnvVarProvider.addVariables({instrumentKey, actionKey, variableKey, value}))
        actions.push({
            id: actionKey,
            commandsContext: parseInstrumentCommands(value.commands, instrumentKey, actionKey),
        })
    })
    return actions
}

function parseInstrumentCommands(commandsObject: any, instrumentKey: string, actionKey: string): CommandContext[] {
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
    return commands
}

function parseWith(withObject: any): WithActions {
    return {
        validExitCodes: withObject?.validExitCodes,
        script: withObject?.script,
        locations: withObject?.locations,
    }

}

function parseProduces(producesObject: any): Map<string, string> {
    const produces: Map<string, string> = new Map()
    parseIntoMap(producesObject).forEach((value, key) => {
        produces.set(key, replaceMissionContextVariables(value))
    })
    return produces
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