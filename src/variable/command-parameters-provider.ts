import {Variable, variablesEquals} from '../model/Variable'

export class CommandParametersProvider {
    public variables: Variable[] = []

    public setParameter(variableValue: string, variableKey: string, instrumentKey: string, actionKey: string, commandKey?: string): void {
        const variable = {
            instrumentKey,
            actionKey,
            commandKey,
        }
        const variableIndex = this.variables.findIndex(existingVariable => variablesEquals(existingVariable, variable))
        if (variableIndex != -1) {
            this.variables[variableIndex].value.set(variableKey, variableValue)
        } else
            this.variables.push({...variable, value: new Map([[variableKey, variableValue]])})
    }

    public getParameter(variableKey: string, instrumentKey: string, actionKey: string, commandKey?: string): string | null {
        const variable = {
            instrumentKey,
            actionKey,
            commandKey,
        }
        const existingVariable = this.variables.find(existingVariable => variablesEquals(existingVariable, variable))
        if (existingVariable) {
            const existingVariableValue = existingVariable.value.get(variableKey)
            if (existingVariableValue)
                return existingVariableValue
        }
        return null
    }
}