import {Instrument} from '../model/Instrument'
import {runCommand} from './command-runner'
import {missionContext} from '../context/mission-context'
import {loadAndParseData} from '../parser/data-parser'

export function runMission(missionFilePath: string): void {
    loadAndParseData(missionFilePath)
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