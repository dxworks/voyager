import {Instrument} from '../model/Instrument'
import {ContextVariableProvider} from './context-variable-provider'

export class MissionContext {

    private static instance: MissionContext

    public instruments: Instrument[]

    public runnableInstruments: string[]

    private variableProvider: ContextVariableProvider

    runAll = true

    private constructor() {
        this.instruments = []
        this.runnableInstruments = []
        this.variableProvider = new ContextVariableProvider()
    }

    public static getInstance(): MissionContext {
        if (!MissionContext.instance) {
            MissionContext.instance = new MissionContext()
        }
        return MissionContext.instance
    }

    public getVariable(key: string): string | null {
        return this.variableProvider.getVariable(key)
    }

    public addVariable(key: string, value: string): void {
        this.variableProvider.addVariable(key, value)
    }
}

export const missionContext = MissionContext.getInstance()