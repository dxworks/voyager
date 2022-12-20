import {Instrument} from '../model/Instrument'
import {parseIntoMap} from './data-parser'
import {Action} from '../model/Action'
import {CommandContext} from '../model/Command'


export function parseInstrument(file: any): Instrument {
    return {
        id: file.id,
        name: file.name,
        version: file.version,
        actions: parseInstrumentActions(file.actions),
        produces: parseProduces(file.produces),
    }
}

function parseInstrumentActions(actionObject: any): Action[] {
    const actions: Action[] = []
    parseIntoMap(actionObject).forEach((value, key) => {
        actions.push({
            id: key,
            commandsContext: parseInstrumentCommands(value.commands),
            parameters: parseIntoMap(value.parameters),
            environment: parseIntoMap(value.environment),
        })
    })
    return actions
}

function parseInstrumentCommands(commandsObject: any): CommandContext[] {
    const commands: CommandContext[] = []
    const commandsMap = parseIntoMap(commandsObject)
    if (commandsMap == null)
        return []
    commandsMap.forEach((command) => {
        let commandType
        if (command.command) {
            commandType = {
                universalCommand: command,
            }
        } else {
            if (command.unix) {
                commandType = {
                    windows: command.windows,
                    unix: command.unix,
                }
            } else {
                commandType = {
                    windows: command.windows,
                    mac: command.mac,
                    linux: command.linux,
                }
            }
        }
        commands.push({
            id: command.id,
            name: command.name,
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