import {Instrument} from '../model/Instrument'
import {ContextVariableProvider} from './context-variable-provider'
import fs from 'fs'

export class MissionContext {

    private static instance: MissionContext

    private name: string

    public instruments: Instrument[]

    public runnableInstruments: string[]

    private variableProvider: ContextVariableProvider

    private logsStream: fs.WriteStream | null

    runAll = true

    private constructor() {
        this.name = ''
        this.instruments = []
        this.runnableInstruments = []
        this.variableProvider = new ContextVariableProvider()
        this.logsStream = null
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

    public getName(): string {
        return this.name
    }

    public setName(name: string): void {
        this.name = name
    }


    public getLogsStream(): fs.WriteStream | null {
        return this.logsStream
    }

    public setLogsStream(value: fs.WriteStream | null): void {
        this.logsStream = value
    }
}

export const missionContext = MissionContext.getInstance()