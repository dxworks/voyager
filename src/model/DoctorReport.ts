export class DoctorReport {

    private _instrumentsDoctorReport: InstrumentDoctorReport[] = []


    get instrumentsDoctorReport(): InstrumentDoctorReport[] {
        return this._instrumentsDoctorReport
    }

    public addInstrumentDoctorReport(instrumentDoctorReport: InstrumentDoctorReport): void {
        this._instrumentsDoctorReport.push(instrumentDoctorReport)
    }
}

export class InstrumentDoctorReport {

    private _instrumentName: string

    private _requirementsByName: Map<string, boolean> = new Map()


    constructor(instrumentName: string) {
        this._instrumentName = instrumentName
    }

    get instrumentName(): string {
        return this._instrumentName
    }

    set instrumentName(value: string) {
        this._instrumentName = value
    }

    get requirementsByName(): Map<string, boolean> {
        return this._requirementsByName
    }
}