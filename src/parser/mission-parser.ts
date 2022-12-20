import {Mission} from '../model/Mission'
import {parseIntoMap} from './data-parser'
import {BaseInstrument} from '../model/Instrument'
import {BaseAction} from '../model/Action'
import {variableHandler} from '../variable/variable-handler'
import {CommandVariablesProvider} from '../variable/command-variables-provider'

export function parseMission(file: any): Mission {
    variableHandler.addCommandVariableProvider(new CommandVariablesProvider())
    return {
        variables: parseIntoMap(file.variables),
        instruments: parseMissionInstruments(file.instruments),
        environment: parseIntoMap(file.environment),
        instrumentsDir: file.instrumentsDir,
    }
}

function parseMissionInstruments(instrumentsObject: any): BaseInstrument[] {
    const instruments: BaseInstrument[] = []
    const instrumentsMap = parseIntoMap(instrumentsObject)
    instrumentsMap.forEach((value, key) => {
        instruments.push({
            id: key,
            actions: parseMissionActions(value),
        })
    })
    return instruments
}

function parseMissionActions(actionsObject: any): BaseAction[] {
    const actions: BaseAction[] = []
    const actionsMap = parseIntoMap(actionsObject)
    actionsMap.forEach((value) => {
        console.log(value)
        actions.push({
            id: value.id,
            parameters: parseIntoMap(value.parameters),
            commandsContext: value.commands,
            environment: parseIntoMap(value.environment),
        })
    })
    return actions
}