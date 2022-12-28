import {variableHandler} from './variable-handler'
import {VariableContext} from '../model/Variable'
import {missionContext} from '../context/mission-context'

const variableRegex = /\${[^}]*}/g

export function replaceMissionContextVariables(targetString: string): string {
    let match = variableRegex.exec(targetString)
    while (match) {
        const stringMatch: string = match[0]
        const variableKey = stringMatch.slice(match.indexOf('{'), stringMatch.indexOf('}'))
        const variableValue = missionContext.getVariable(variableKey)
        if (variableValue != null)
            targetString = targetString.replace(stringMatch, variableValue)
        match = variableRegex.exec(targetString)
    }
    return targetString
}

export function replaceParameters(targetString: string, instrumentKey: string, actionKey: string, commandKey: string): string {
    if (targetString) {
        let match = variableRegex.exec(targetString)
        while (match) {
            const stringMatch: string = match[0]
            const variableKey = stringMatch.slice(stringMatch.indexOf('{') + 1, stringMatch.indexOf('}'))
            const variableValue = variableHandler.getParameter({instrumentKey, actionKey, commandKey, variableKey})
            if (variableValue != null)
                targetString = targetString.replace(stringMatch, variableValue)
            match = variableRegex.exec(targetString)
        }
    }
    return targetString
}

export function getEnvironmentVariables(envContext: VariableContext): Map<string, string> {
    return variableHandler.getEnvironmentVariables(envContext) //TODO: replace variables form environment
}