import {Instrument} from '../model/Instrument'
import {VariableProvider} from './variable-provider'

export class MissionContext {

    private static instance: MissionContext

    private instruments: Instrument[]
    private runnableInstruments: string[]
    private variableProvider: VariableProvider

    runAll = true

    private constructor() {
        this.instruments = []
        this.runnableInstruments = []
        this.variableProvider = VariableProvider.getInstance()
    }

    public static getInstance(): MissionContext {
        if (!MissionContext.instance) {
            MissionContext.instance = new MissionContext()
        }
        return MissionContext.instance
    }

    public setInstruments(instruments: Instrument[]): void {
        this.instruments = instruments
    }

    public getInstruments(): Instrument[] {
        return this.instruments
    }

    public setRunnableInstruments(instruments: string[]): void {
        this.runnableInstruments = instruments
    }

    public getRunnableInstruments(): string[] {
        return this.runnableInstruments
    }

    public getVariable(key: string): string | null {
        return this.variableProvider.getVariable(key)
    }

    public addVariable(key: string, value: string): void {
        this.variableProvider.addVariable(key, value)
    }
}

export const missionContext = MissionContext.getInstance()