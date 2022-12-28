import {Instrument} from '../model/Instrument'
import {parseIntoMap} from './data-parser'
import {Action} from '../model/Action'
import {CommandContext} from '../model/Command'
import {ParametersProvider} from '../variable/parameters-provider'
import {variableHandler} from '../variable/variable-handler'
import {
    getEnvironmentVariables,
    replaceMissionContextVariables,
    replaceParameters,
} from '../variable/variable-operations'

let actionVarProvider: ParametersProvider
let commandVarProvider: ParametersProvider
let commandEnvVarProvider: ParametersProvider
let actionEnvVarProvider: ParametersProvider

export function parseInstrument(file: any): Instrument {
    initVariableProvider()
    const actions = parseInstrumentActions(file.actions, file.id)
    cleanUpVariableProvider()
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
            commandType = replaceParameters(value.command, instrumentKey, actionKey, commandKey)
        else
            commandType = {
                windows: replaceParameters(value.command.windows, instrumentKey, actionKey, commandKey),
                unix: replaceParameters(value.command.unix, instrumentKey, actionKey, commandKey),
                mac: replaceParameters(value.command.mac, instrumentKey, actionKey, commandKey),
                linux: replaceParameters(value.command.linux, instrumentKey, actionKey, commandKey),
            }
        commands.push({
            id: commandKey,
            command: commandType,
            environment: getEnvironmentVariables({instrumentKey, actionKey, commandKey}),
        })
    })
    return commands
}

function parseProduces(producesObject: any): Map<string, string> {
    const produces: Map<string, string> = new Map()
    parseIntoMap(producesObject).forEach((value, key) => {
        produces.set(key, replaceMissionContextVariables(value))
    })
    return produces
}

function initVariableProvider(): void {
    commandVarProvider = new ParametersProvider()
    actionVarProvider = new ParametersProvider()
    commandEnvVarProvider = new ParametersProvider()
    actionEnvVarProvider = new ParametersProvider()
    variableHandler.addParametersProvider(commandVarProvider, actionVarProvider)
    variableHandler.addEnvironmentVariablesProviders(commandEnvVarProvider, actionEnvVarProvider)
}

function cleanUpVariableProvider(): void {
    variableHandler.popParameterProvider()
    variableHandler.popEnvironmentVariablesProvider(2)
}