import {Instrument} from '../model/Instrument'
import {runCommand} from './command-runner'
import {missionContext} from '../context/mission-context'

export function runMission(): void {
    if (missionContext.runAll)
        missionContext.instruments.forEach((instrument) => {
            runInstrument(instrument)
        })
    else {
        missionContext.runnableInstruments.map(runnableInstrument => missionContext.instruments.find((instrument) => instrument.id == runnableInstrument))
            .filter(instrument => !!instrument)
            .forEach(instrument => runInstrument(instrument!))
    }
}

function runInstrument(instrument: Instrument): void {
    instrument.actions.forEach((action) => {
        action.commandsContext.forEach((commandContext) => runCommand(commandContext))
    })
}