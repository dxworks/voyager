export const ROOT_DIR = 'rootDir'
export const INSTRUMENTS_DIR = 'instrumentsDir'
export const INSTRUMENT_KEY = 'instrument'
export const INSTRUMENTS_DEFAULT_DIR = './instruments'

export class ContextVariableProvider {

    private variables: Map<string, string> = new Map()


    public addVariable(key: string, value: string): void {
        this.variables.set(key, value)
    }

    public getVariable(key: string): string | null {
        const value: string | undefined = this.variables.get(key)
        return value ? value : null
    }
}