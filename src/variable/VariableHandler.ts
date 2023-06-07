import {VariableProvider} from './VariableProvider'
import {ExtendedVariableContext, Variable, VariableContext} from '../model/Variable'

export class VariableHandler {

    private readonly parametersProviders: VariableProvider[] = []

    private readonly environmentVariablesProviders: VariableProvider[] = []

    public addParametersProvider(...parametersProvider: VariableProvider[]): void {
        this.parametersProviders.push(...parametersProvider)
    }

    public getParameter(variableContext: ExtendedVariableContext): string | null {
        for (const parametersProvider of this.parametersProviders) {
            const matchingVariable = parametersProvider.getVariables().filter((variable) => this.isVariableInContext(variable, variableContext))
                .find((variable) => variable.variableKey == variableContext.variableKey)
            if (matchingVariable && matchingVariable.value) {
                return matchingVariable.value
            }
        }
        return null
    }

    public addEnvironmentVariablesProviders(...envVarProvider: VariableProvider[]): void {
        this.environmentVariablesProviders.push(...envVarProvider)
    }

    public getEnvironmentVariables(variableContext: VariableContext): Map<string, string> {
        const envVar = new Map()
        const alreadyExisting = (variableKey: string): boolean => {
            return !!envVar.get(variableKey)
        }
        for (const envVarProvider of this.environmentVariablesProviders) {
            envVarProvider.getVariables().filter((variable) => this.isVariableInContext(variable, variableContext))
                .filter((variable) => !alreadyExisting(variable.variableKey))
                .forEach((variable) => envVar.set(variable.variableKey, variable.value))
        }
        return envVar
    }

    private isVariableInContext(variable: Variable, context: VariableContext): boolean {
        const checkKey = (variableKey: string | undefined, contextKey: string): boolean => {
            return !!variableKey && variableKey == contextKey
        }
        if (!variable.instrumentKey && !variable.actionKey)
            return true
        if (checkKey(variable.instrumentKey, context.instrumentKey!) && checkKey(variable.actionKey, context.actionKey!)) {
            if (!variable.commandKey)
                return true
            if (checkKey(variable.commandKey, context.commandKey!))
                return true
        }
        return false
    }
}