export class CommandSummary {
    private _runningTime = ''
    private _success = true


    get runningTime(): string {
        return this._runningTime
    }

    set runningTime(value: string) {
        this._runningTime = value
    }

    get success(): boolean {
        return this._success
    }

    set success(value: boolean) {
        this._success = value
    }
}