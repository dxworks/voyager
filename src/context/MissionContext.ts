import {Instrument} from '../model/Instrument'
import {ContextVariableProvider} from './context-variable-provider'
import fs from 'fs'
import {MissionSummary} from '../model/summary/MissionSummary'

export class MissionContext {

    private static instance: MissionContext

    private _name: string

    private _instruments: Instrument[]

    private _runnableInstruments: string[]

    private variableProvider: ContextVariableProvider

    private _logsStream: fs.WriteStream | null

    private readonly _missionSummary: MissionSummary

    runAll = true

    private constructor() {
        this._name = ''
        this._instruments = []
        this._runnableInstruments = []
        this.variableProvider = new ContextVariableProvider()
        this._logsStream = null
        this._missionSummary = new MissionSummary()
    }

    get name(): string {
        return this._name
    }

    set name(value: string) {
        this._name = value
        this.missionSummary.missionName = value
    }

    get instruments(): Instrument[] {
        return this._instruments
    }

    set instruments(value: Instrument[]) {
        this._instruments = value
    }

    get runnableInstruments(): string[] {
        return this._runnableInstruments
    }

    set runnableInstruments(value: string[]) {
        this._runnableInstruments = value
    }

    get logsStream(): fs.WriteStream | null {
        return this._logsStream
    }

    set logsStream(value: fs.WriteStream | null) {
        this._logsStream = value
    }

    get missionSummary(): MissionSummary {
        return this._missionSummary
    }

    public static getInstance(): MissionContext {
        if (!MissionContext.instance) {
            MissionContext.instance = new MissionContext()
        }
        return MissionContext.instance
    }

    public getResultsArchiveName(): string {
        return this._name + '-results.zip'
    }

    public getVariable(key: string): string | null {
        return this.variableProvider.getVariable(key)
    }

    public addVariable(key: string, value: string): void {
        this.variableProvider.addVariable(key, value)
    }
}

export const missionContext = MissionContext.getInstance()