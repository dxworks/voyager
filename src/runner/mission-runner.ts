import {MissionContext} from '../model/MissionContext'
import {runInstrument} from './instrument-runner'

export function runMission(missionContext: MissionContext): void {
    missionContext.mission.instruments.forEach((missionInstrument) => {
        const actualInstrument = missionContext.instruments.find((instrument) => instrument.name == missionInstrument.id)
        if (actualInstrument) {
            runInstrument({
                instrument: actualInstrument,
                actions: missionInstrument.actions,
            })
        }
    })
}