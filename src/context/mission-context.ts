import {Instrument} from '../model/Instrument'

export class MissionContext {

    private static instance: MissionContext

    private instruments: Instrument[]
    private runnableInstruments: string[]

    runAll = true

    private constructor() {
        this.instruments = []
        this.runnableInstruments = []
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
}

export const missionContext = MissionContext.getInstance()