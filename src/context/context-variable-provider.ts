export const ROOT_DIR = 'rootDir'
export const INSTRUMENTS_DIR = 'instrumentsDir'

const defaultVariables = new Map([[INSTRUMENTS_DIR, './instrument']])

export class ContextVariableProvider {

    private variables: Map<string, string> = defaultVariables


    public addVariable(key: string, value: string): void {
        this.variables.set(key, value)
    }

    public getVariable(key: string): string | null {
        const value: string | undefined = this.variables.get(key)
        return value ? value : null
    }
}