import {Instrument} from '../model/Instrument'
import {parseIntoMap} from './data-parser'
import {Action} from '../model/Action'
import {CommandContext} from '../model/Command'
import {ParametersProvider} from '../variable/parameters-provider'
import {variableHandler} from '../variable/variable-handler'
import {replaceParameters} from '../variable/variable-replacer'

let actionVarProvider: ParametersProvider
let commandVarProvider: ParametersProvider
let actionEnvVarProvider: ParametersProvider
let commandEnvVarProvider: ParametersProvider

export function parseInstrument(file: any): Instrument {
    variableProviderInit()
    const actions = parseInstrumentActions(file.actions, file.id)
    variableProviderCleanUp()
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
            environment: parseIntoMap(value.environment),
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
            actionEnvVarProvider.addVariables({instrumentKey, actionKey, commandKey, variableKey, value}))
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
        })
    })
    return commands
}

function parseProduces(producesObject: any): Map<string, string> {
    const produces: Map<string, string> = new Map()
    Array.from(parseIntoMap(producesObject)).forEach(([key, value]) => {
        produces.set(key, value)
    })
    return produces
}

function variableProviderInit(): void {
    actionVarProvider = new ParametersProvider()
    commandVarProvider = new ParametersProvider()
    actionEnvVarProvider = new ParametersProvider()
    commandEnvVarProvider = new ParametersProvider()
    variableHandler.addParametersProvider(commandVarProvider, actionVarProvider)
    variableHandler.addEnvironmentVariablesProviders(commandEnvVarProvider, actionEnvVarProvider)

}

function variableProviderCleanUp(): void {
    variableHandler.popParameterProvider()
    variableHandler.popEnvironmentVariablesProvider(2)
}