import {INSTRUMENTS_DIR} from './key-constants'

const defaultVariables = new Map([[INSTRUMENTS_DIR, './instrument']])

export class VariableProvider {
    private static instance: VariableProvider

    private variables: Map<string, string>

    private constructor() {
        this.variables = defaultVariables
    }

    public addVariables(variables: Map<string, string>): void {
        if (this.variables)
            this.variables = new Map([...Array.from(this.variables.entries()), ...Array.from(variables.entries())])
        else
            this.variables = variables
    }

    public addVariable(key: string, value: string): void {
        this.variables.set(key, value)
    }

    public getVariable(key: string): string | null {
        const value: string | undefined = this.variables.get(key)
        if (value)
            return value
        else
            return null

    }

    public static getInstance(): VariableProvider {
        if (!VariableProvider.instance) {
            VariableProvider.instance = new VariableProvider()
        }

        return VariableProvider.instance
    }

}

export const variableProvider: VariableProvider = VariableProvider.getInstance()