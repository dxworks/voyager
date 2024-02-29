import {Instrument} from '../model/Instrument'
import {ContextVariableProvider, RESULTS_UNPACK_DIR, RESULTS_ZIP_DIR} from './context-variable-provider'
import fs from 'fs'
import {MissionSummary} from '../model/summary/MissionSummary'
import {DoctorReport} from '../model/DoctorReport'
import {UnpackMapping} from '../model/UnpackMapping'

export class MissionContext {

    private static instance: MissionContext

    private _name: string

    private _instruments: Instrument[]

    private _runnableInstruments: string[]

    private variableProvider: ContextVariableProvider

    private _logsStream: fs.WriteStream | null

    private readonly _missionSummary: MissionSummary

    private readonly _doctorReport: DoctorReport

    private readonly _unpackMapping: UnpackMapping

    private _targets: string[] = []

    private _missionNameInZipFile = false

    runAll = true

    private constructor() {
        this._name = ''
        this._instruments = []
        this._runnableInstruments = []
        this.variableProvider = new ContextVariableProvider()
        this._logsStream = null
        this._missionSummary = new MissionSummary()
        this._doctorReport = new DoctorReport()
        this._unpackMapping = new UnpackMapping()
    }

    get name(): string {
        return this._name
    }

    set name(value: string) {
        this._name = value
        this.missionSummary.missionName = value
        this.addVariable(RESULTS_ZIP_DIR, `./${missionContext.name}-voyager-results.zip`)
        this.addVariable(RESULTS_UNPACK_DIR, `./${missionContext.name}-voyager-results`)
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

    get doctorReport(): DoctorReport {
        return this._doctorReport
    }

    get unpackMapping(): UnpackMapping {
        return this._unpackMapping
    }

    get targets(): string[] {
        return this._targets
    }

    set targets(value: string[]) {
        this._targets = value
    }

    set missionNameInZipFile(value: boolean) {
        this._missionNameInZipFile = value
    }

    get missionNameInZipFile(): boolean {
        return this._missionNameInZipFile
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