import {InstrumentSummary} from './InstrumentSummary'

export class MissionSummary {
    private _missionName = ''
    private _instrumentsSummary: Map<string, InstrumentSummary> = new Map<string, InstrumentSummary>()
    private _runningTime = ''


    get missionName(): string {
        return this._missionName
    }

    set missionName(value: string) {
        this._missionName = value
    }


    get instrumentsSummary(): Map<string, InstrumentSummary> {
        return this._instrumentsSummary
    }

    set instrumentsSummary(value: Map<string, InstrumentSummary>) {
        this._instrumentsSummary = value
    }

    get runningTime(): string {
        return this._runningTime
    }

    set runningTime(value: string) {
        this._runningTime = value
    }

    public addInstrumentSummary(instrumentName: string, instrumentSummary: InstrumentSummary): void {
        this._instrumentsSummary.set(instrumentName, instrumentSummary)
    }

    public getInstrumentSummary(instrumentName: string): InstrumentSummary {
        return this._instrumentsSummary.get(instrumentName)!
    }
}