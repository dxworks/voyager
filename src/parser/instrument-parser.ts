import {Instrument} from '../model/Instrument'
import {parseIntoMap} from './data-parser'
import {Action, DefaultAction, Location, Requirement, WithAction} from '../model/Action'
import {Command, CommandContext} from '../model/Command'
import {VariableProvider} from '../variable/VariableProvider'
import {
    getEnvironmentVariables,
    replaceMissionContextVariables,
    replaceParameters,
} from '../variable/variable-operations'
import {VariableHandler} from '../variable/VariableHandler'
import {
    missionActionEnvVarProvider,
    missionActionVarProvider,
    missionCommandEnvVarProvider,
    missionCommandVarProvider,
    missionEnvVarProvider,
} from '../context/mission-variable-providers'
import {isDefaultAction} from '../runner/action-utils'
import {missionContext} from '../context/MissionContext'
import {
    INSTRUMENT_DIR_NAME,
    INSTRUMENT_NAME,
    INSTRUMENT_PATH,
    INSTRUMENT_RESULTS,
    RESULTS_UNPACK_DIR,
} from '../context/context-variable-provider'
import path from 'node:path'

let variableHandler: VariableHandler
let actionVarProvider: VariableProvider
let commandVarProvider: VariableProvider
let commandEnvVarProvider: VariableProvider
let actionEnvVarProvider: VariableProvider

 
export function parseInstrument(instrumentsDirPath: string, instrumentDir: string, file: any): Instrument {
    initVariableProvider()
    const instrumentPath = path.resolve(instrumentsDirPath, instrumentDir)
    missionContext.addVariable(INSTRUMENT_NAME, file.name)
    missionContext.addVariable(INSTRUMENT_DIR_NAME, instrumentDir)
    missionContext.addVariable(INSTRUMENT_PATH, instrumentPath)
    missionContext.addVariable(INSTRUMENT_RESULTS, path.resolve(<string>missionContext.getVariable(RESULTS_UNPACK_DIR), file.name))
    const actions = parseInstrumentActions(file.actions, file.id)
    return {
        id: file.id,
        name: file.name,
        version: file.version,
        instrumentPath: instrumentPath,
        actions: actions,
    }
}

function parseInstrumentActions(actionObject: any, instrumentKey: string): Map<string, Action> {
    const actions: Map<string, Action> = new Map<string, Action>()
    parseIntoMap(actionObject).forEach((value, actionKey) => {
        parseIntoMap(value.parameters).forEach((value, variableKey) =>
            actionVarProvider.addVariables({instrumentKey, actionKey, variableKey, value}))
        parseIntoMap(value.environment).forEach((value, variableKey) =>
            actionEnvVarProvider.addVariables({instrumentKey, actionKey, variableKey, value}))
        const action = isDefaultAction(actionKey) ? parseDefaultAction(value, instrumentKey, actionKey) : parseAction(value.commands, instrumentKey, actionKey)
        actions.set(actionKey, action)
    })
    return actions
}

function parseAction(commandsObject: any, instrumentKey: string, actionKey: string): Action {
    return {
        name: actionKey,
        commandsContext: parseCommands(commandsObject, instrumentKey, actionKey),
    }
}

function parseCommands(commandsObject: any, instrumentKey: string, actionKey: string): CommandContext[] {
    const commands: CommandContext[] = []
    const commandsMap = parseIntoMap(commandsObject)
    commandsMap.forEach((value) => {
        const commandKey = value.id
        parseIntoMap(value.parameters).forEach((value, variableKey) =>
            commandVarProvider.addVariables({instrumentKey, actionKey, commandKey, variableKey, value}))
        parseIntoMap(value.environment).forEach((value, variableKey) =>
            commandEnvVarProvider.addVariables({instrumentKey, actionKey, commandKey, variableKey, value}))
        let commandType
        if (typeof value.command == 'string')
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
            dir: replaceMissionContextVariables(value.dir),
            environment: getEnvironmentVariables(variableHandler, {instrumentKey, actionKey, commandKey}),
            with: parseWith(value.with),
        })
    })
    return commands
}

function parseDefaultAction(defaultActionObject: any, instrumentKey: string, actionKey: string): DefaultAction {
    return {
        name: actionKey,
        commandsContext: parseCommands(defaultActionObject.commands, instrumentKey, actionKey),
        with: parseWith(defaultActionObject.with),
        produces: parseProduces(defaultActionObject.produces),
    }
}

function parseWith(withObject: any): WithAction {
    return {
        validExitCodes: withObject?.validExitCodes,
        script: withObject?.script,
        locations: parseLocations(withObject?.locations),
        requirements: parseRequirements(withObject?.requirements),
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
        rmDir: locationObject.rmDir,
    }
}

function parseRequirements(requirementsObject: any): Requirement[] {
    const requirements: Requirement[] = []
    parseIntoMap(requirementsObject).forEach(value => {
        requirements.push(parseRequirement(value))
    })
    return requirements
}

function parseRequirement(requirementObject: any): Requirement {
    return {
        name: requirementObject.name,
        min: requirementObject.min,
        match: requirementObject.match,
        command: parseRequirementCommand(requirementObject.command),
    }
}

function parseRequirementCommand(commandObject: any): string | Command {
    let commandType
    if (typeof commandObject == 'string')
        commandType = commandObject
    else
        commandType = {
            windows: commandObject.windows,
            unix: commandObject.unix,
            mac: commandObject.mac,
            linux: commandObject.linux,
        }

    return commandType
}

function parseProduces(producesObject: any): Map<string, string> {
    const producesMap = new Map()
    parseIntoMap(producesObject).forEach((filePath, fileName) => {
            producesMap.set(fileName, replaceMissionContextVariables(filePath))
        }
    )
    return producesMap
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