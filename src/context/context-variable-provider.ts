export const MISSION_ROOT_DIR = 'rootDir'
export const MISSION_NAME = 'missionName'
export const INSTRUMENTS_DIR = 'instrumentsDir'
export const INSTRUMENT_NAME = 'instrument'
export const VOYAGER_WORKING_DIR = 'voyagerWorkingDir'
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