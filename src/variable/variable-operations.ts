import {VariableContext} from '../model/Variable'
import {missionContext} from '../context/mission-context'
import {VariableHandler} from './variable-handler'

const variableRegex = /\${[^}]*}/g

export function replaceMissionContextVariables(targetString: string): string {
    const replaceFunction = (variableKey: string): string | null =>
        missionContext.getVariable(variableKey)
    return replaceRegex(targetString, replaceFunction)
}

export function replaceParameters(variableHandler: VariableHandler, targetString: string, instrumentKey: string, actionKey: string, commandKey: string): string {
    targetString = replaceMissionContextVariables(targetString)
    const replaceFunction = (variableKey: string): string | null =>
        variableHandler.getParameter({instrumentKey, actionKey, commandKey, variableKey})
    return replaceRegex(targetString, replaceFunction)
}

function replaceRegex(targetString: string, replaceFunction: (variableKey: string) => string | null) {
    if (targetString) {
        let match = variableRegex.exec(targetString)
        while (match) {
            const stringMatch: string = match[0]
            const variableKey = stringMatch.slice(stringMatch.indexOf('{') + 1, stringMatch.indexOf('}'))
            const variableValue = replaceFunction(variableKey)
            if (variableValue != null)
                targetString = targetString.replace(stringMatch, variableValue)
            match = variableRegex.exec(targetString)
        }
    }
    return targetString
}

export function getEnvironmentVariables(variableHandler: VariableHandler, envContext: VariableContext): Map<string, string> {
    const environmentVariables = new Map()
    variableHandler.getEnvironmentVariables(envContext).forEach((value: string, key: string) => environmentVariables.set(key, replaceMissionContextVariables(value)))
    return environmentVariables
}