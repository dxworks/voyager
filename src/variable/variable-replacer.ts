import {variableHandler} from './variable-handler'

const variableRegex = /\${[^}]*}/g

export function replaceVariable(targetString: string): string {
    let match = variableRegex.exec(targetString)
    while (match) {
        const stringMatch: string = match[0]
        const variableKey = stringMatch.slice(match.indexOf('{'), stringMatch.indexOf('}'))
        const variableValue = variableHandler.getVariable(variableKey)
        if (variableValue != null)
            targetString = targetString.replace(stringMatch, variableValue) //TODO check if it passes to the next match even if no replace has been made
        match = variableRegex.exec(targetString)
    }
    return targetString
}