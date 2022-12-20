import {variableProvider, VariableProvider} from './variable-provider'
import {CommandVariablesProvider} from './command-variables-provider'

export class VariableHandler {
    private static instance: VariableHandler
    public variableProvider: VariableProvider
    private commandVariablesProviders: CommandVariablesProvider[]

    private constructor() {
        this.variableProvider = variableProvider
        this.commandVariablesProviders = []
    }

    public static getInstance(): VariableHandler {
        if (!VariableHandler.instance) {
            VariableHandler.instance = new VariableHandler()
        }

        return VariableHandler.instance
    }

    public addCommandVariableProvider(commandVariablesProvider: CommandVariablesProvider): void {
        this.commandVariablesProviders.push(commandVariablesProvider)
    }

    public getCommandVariable(instrumentKey: string, actionKey: string, commandKey: string): string | null {
        this.commandVariablesProviders.forEach((commandVariablesProvider) => {
            const value = commandVariablesProvider.getVariable(instrumentKey, actionKey, commandKey)
            if (value)
                return value
        })
        return null
    }
}

export const variableHandler: VariableHandler = VariableHandler.getInstance()