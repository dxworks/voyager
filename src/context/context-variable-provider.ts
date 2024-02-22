export const MISSION_RESULT_ARCHIVE_NAME = 'MissionReport.html'
export const MISSION_ROOT_DIR = 'rootDir'
export const MISSION_NAME = 'mission'
export const INSTRUMENTS_DIR = 'instrumentsDir'
export const INSTRUMENT_NAME = 'instrument'
export const INSTRUMENT_DIR_NAME = 'instrumentDir'
export const INSTRUMENT_PATH = 'instrumentPath'
export const INSTRUMENT_RESULTS = 'instrumentResults'
export const VOYAGER_WORKING_DIR = 'voyagerWorkingDir'
export const RESULTS_ZIP_DIR = 'resultsDir'

export const RESULTS_UNPACK_DIR = 'resultsUnpackTarget'


export const INSTRUMENTS_DIR_DEFAULT_VALUE = './instruments'

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