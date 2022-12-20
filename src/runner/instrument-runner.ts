import {runCommand} from './command-runner'
import {InstrumentContext} from '../model/InstrumentContext'

export function runInstrument(instrumentContext: InstrumentContext): void {
    instrumentContext.actions.forEach((missionAction) => {
        const instrumentAction = instrumentContext.instrument.actions.find((action) => action.id = missionAction.id)
        if (instrumentAction)
            instrumentAction.commandsContext.forEach((commandContext) => runCommand(commandContext))
    })
}