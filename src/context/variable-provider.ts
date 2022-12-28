import {INSTRUMENTS_DIR} from '../variable/key-constants'

const defaultVariables = new Map([[INSTRUMENTS_DIR, './instrument']])

export class VariableProvider {

    private static instance: VariableProvider

    private variables: Map<string, string>

    private constructor() {
        this.variables = defaultVariables
    }

    public addVariable(key: string, value: string): void {
        this.variables.set(key, value)
    }

    public getVariable(key: string): string | null {
        const value: string | undefined = this.variables.get(key)
        return value ? value : null
    }

    public static getInstance(): VariableProvider {
        if (!VariableProvider.instance) {
            VariableProvider.instance = new VariableProvider()
        }
        return VariableProvider.instance
    }

}