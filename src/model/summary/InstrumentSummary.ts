import {CommandSummary} from './CommandSummary'

export class InstrumentSummary {

    private _commandsSummary: Map<string, CommandSummary> = new Map<string, CommandSummary>()
    private _runningTime = ''


    get commandsSummary(): Map<string, CommandSummary> {
        return this._commandsSummary
    }

    set commandsSummary(value: Map<string, CommandSummary>) {
        this._commandsSummary = value
    }

    get runningTime(): string {
        return this._runningTime
    }

    set runningTime(value: string) {
        this._runningTime = value
    }


    public addCommandSummary(commandName: string, commandSummary: CommandSummary): void {
        this._commandsSummary.set(commandName, commandSummary)
    }
}