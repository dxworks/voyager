import {variableHandler} from './variable-handler'
import {VariableContext} from '../model/Variable'
import {missionContext} from '../context/mission-context'

const variableRegex = /\${[^}]*}/g

export function replaceMissionContextVariables(targetString: string): string {
    const replaceFunction = (variableKey: string): string | null => {
        return missionContext.getVariable(variableKey)
    }
    return applyRegex(targetString, replaceFunction)
}

export function replaceParameters(targetString: string, instrumentKey: string, actionKey: string, commandKey: string): string {
    const replaceFunction = (variableKey: string): string | null => {
        return variableHandler.getParameter({instrumentKey, actionKey, commandKey, variableKey})
    }
    return applyRegex(targetString, replaceFunction)
}

function applyRegex(targetString: string, replaceFunction: (variableKey: string) => string | null) {
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

export function getEnvironmentVariables(envContext: VariableContext): Map<string, string> {
    const environmentVariables = new Map()
    variableHandler.getEnvironmentVariables(envContext).forEach((value, key) => {
        environmentVariables.set(key, replaceMissionContextVariables(value))
    })
    return environmentVariables
}