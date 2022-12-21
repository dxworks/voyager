import {ParametersProvider} from './parameters-provider'
import {VariableContext} from '../model/Variable'

export class VariableHandler {
    private static instance: VariableHandler
    private parametersProvider: ParametersProvider[]
    private environmentVariablesProvider: ParametersProvider[]

    private constructor() {
        this.parametersProvider = []
        this.environmentVariablesProvider = []
    }

    public static getInstance(): VariableHandler {
        if (!VariableHandler.instance) {
            VariableHandler.instance = new VariableHandler()
        }

        return VariableHandler.instance
    }

    public addParametersProvider(...parametersProvider: ParametersProvider[]): void {
        this.parametersProvider.push(...parametersProvider)
    }

    public popParameterProvider(number?: number): void {
        if (number)
            for (let i = 0; i < number; i++)
                this.parametersProvider.pop()
        else
            this.parametersProvider.pop()
    }

    public getParameter(variableContext: VariableContext): string | null {

        for (const parametersProvider of this.parametersProvider) {
            parametersProvider.getVariables().find((variable) => {
                if (variable.instrumentKey == variableContext.instrumentKey && variable.actionKey == variableContext.actionKey) {
                    if (variable.commandKey)
                        if (variable.commandKey == variableContext.commandKey && variable.variableKey == variableContext.variableKey)
                            return variable.value
                        else if (variable.variableKey == variableContext.variableKey)
                            return variable.value
                }
            })
        }
        return null
    }

    public addEnvironmentVariablesProviders(...envVarProvider: ParametersProvider[]): void {
        this.environmentVariablesProvider.push(...envVarProvider)
    }

    public popEnvironmentVariablesProvider(number?: number): void {
        if (number)
            for (let i = 0; i < number; i++)
                this.environmentVariablesProvider.pop()
        else
            this.environmentVariablesProvider.pop()
    }

    public getEnvironmentVariables(variableContext: VariableContext): Map<string, string> {
        const envVar = new Map()
        const alreadyExisting = (variableKey: string): boolean => {
            return envVar.get(variableKey)
        }
        for (const envVarProvider of this.environmentVariablesProvider) {
            envVarProvider.getVariables().find((variable) => {
                if (variable.instrumentKey && variable.actionKey) {
                    if (variable.instrumentKey == variableContext.instrumentKey && variable.actionKey == variableContext.actionKey) {
                        if (variable.commandKey) {
                            if (variable.commandKey == variableContext.commandKey && variable.variableKey == variableContext.variableKey && !alreadyExisting(variable.variableKey))
                                envVar.set(variable.variableKey, variable.value)
                        } else if (variable.variableKey == variableContext.variableKey && !alreadyExisting(variable.variableKey))
                            envVar.set(variable.variableKey, variable.value)
                    }
                } else if (variable.variableKey == variableContext.variableKey && !alreadyExisting(variable.variableKey))
                    envVar.set(variable.variableKey, variable.value)
            })
        }
        return envVar
    }

}

export const variableHandler: VariableHandler = VariableHandler.getInstance()