import {Instrument} from '../model/Instrument'
import {runCommand} from './command-runner'
import {missionContext} from '../context/mission-context'

export function runMission(): void {
    const instruments = missionContext.getInstruments()
    if (missionContext.runAll)
        instruments.forEach((instrument) => {
            runInstrument(instrument)
        })
    else {
        missionContext.getRunnableInstruments().forEach((runnableInstrument) => {
            const instrument = instruments.find((instrument) => instrument.id == runnableInstrument)
            if (instrument)
                runInstrument(instrument)
        })
    }
}

function runInstrument(instrument: Instrument): void {
    instrument.actions.forEach((action) => {
        action.commandsContext.forEach((commandContext) => runCommand(commandContext))
    })
}