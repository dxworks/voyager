import {Instrument} from '../model/Instrument'
import {parseIntoMap} from './data-parser'
import {Action} from '../model/Action'
import {CommandContext} from '../model/Command'
import {CommandParametersProvider} from '../variable/command-parameters-provider'
import {variableHandler} from '../variable/variable-handler'
import {replaceParameters, replaceVariables} from '../variable/variable-replacer'

let instrumentVariableProvider = new CommandParametersProvider()

export function parseInstrument(file: any): Instrument {
    variableHandler.addCommandVariableProvider(instrumentVariableProvider)
    const actions = parseInstrumentActions(file.actions, file.id)
    variableHandler.deleteCommandVariableProvider()
    instrumentVariableProvider = new CommandParametersProvider()
    return {
        id: file.id,
        name: file.name,
        version: file.version,
        actions: actions,
        produces: parseProduces(file.produces),
    }
}

function parseInstrumentActions(actionObject: any, instrumentId: string): Action[] {
    const actions: Action[] = []
    parseIntoMap(actionObject).forEach((value, actionId) => {
        parseIntoMap(value.parameters).forEach((value, variableId) => {
            instrumentVariableProvider.setParameter(value, variableId, instrumentId, actionId)
        })
        actions.push({
            id: actionId,
            commandsContext: parseInstrumentCommands(value.commands, instrumentId, actionId),
            environment: parseIntoMap(value.environment),
        })
    })
    return actions
}

function parseInstrumentCommands(commandsObject: any, instrumentId: string, actionId: string): CommandContext[] {
    const commands: CommandContext[] = []
    const commandsMap = parseIntoMap(commandsObject)
    commandsMap.forEach((value, commandId) => {
        parseIntoMap(value.parameters).forEach((value, variableId) => {
            instrumentVariableProvider.setParameter(value, variableId, instrumentId, actionId, commandId)
        })
        let commandType
        if (typeof value.command === 'string')
            commandType = replaceParameters(value.command, instrumentId, actionId, commandId)
        else
            commandType = {
                windows: replaceParameters(value.command.windows, instrumentId, actionId, commandId),
                unix: replaceParameters(value.command.unix, instrumentId, actionId, commandId),
                mac: replaceParameters(value.command.mac, instrumentId, actionId, commandId),
                linux: replaceParameters(value.command.linux, instrumentId, actionId, commandId),
            }
        commands.push({
            id: commandId,
            command: commandType,
        })
    })
    return commands
}

function parseProduces(producesObject: any): Map<string, string> {
    const produces: Map<string, string> = new Map()
    Array.from(parseIntoMap(producesObject)).forEach(([key, value]) => {
        produces.set(key, replaceVariables(value))
    })
    return produces
}