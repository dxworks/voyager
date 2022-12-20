import {variableProvider, VariableProvider} from './variable-provider'
import {CommandParametersProvider} from './command-parameters-provider'

export class VariableHandler {
    private static instance: VariableHandler
    public variableProvider: VariableProvider
    private commandVariablesProviders: CommandParametersProvider[]

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

    public addCommandVariableProvider(commandVariablesProvider: CommandParametersProvider): void {
        this.commandVariablesProviders.push(commandVariablesProvider)
    }

    public deleteCommandVariableProvider(): void {
        this.commandVariablesProviders.pop()
    }

    public getCommandVariable(variableKey: string, instrumentKey: string, actionKey: string, commandKey: string): string | null {
        let value = null
        for(const commandVariablesProvider of this.commandVariablesProviders){
            value = commandVariablesProvider.getParameter(variableKey, instrumentKey, actionKey, commandKey)
            if(value != null)
                break
            value = commandVariablesProvider.getParameter(variableKey, instrumentKey, actionKey)
            if (value)
                break
        }
        return value
    }
}

export const variableHandler: VariableHandler = VariableHandler.getInstance()