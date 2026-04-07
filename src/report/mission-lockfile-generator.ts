import fs from 'fs'
import path from 'node:path'
import yaml from 'js-yaml'
import {missionContext} from '../context/MissionContext'
import {VOYAGER_WORKING_DIR} from '../context/context-variable-provider'
import {Instrument} from '../model/Instrument'

const MISSION_LOCKFILE_NAME = 'voyager.lock.yml'

interface MissionLockfileInstrument {
    id: string
    name: string
    version: string
    runningTime: string
}

interface MissionLockfile {
    mission: string
    runningTime: string
    tools: MissionLockfileInstrument[]
}

export function getMissionLockFilePath(): string {
    return path.join(<string>missionContext.getVariable(VOYAGER_WORKING_DIR), MISSION_LOCKFILE_NAME)
}

export function generateMissionLockFile(instruments: Instrument[]): string {
    const lockfile: MissionLockfile = {
        mission: missionContext.missionSummary.missionName,
        runningTime: missionContext.missionSummary.runningTime,
        tools: instruments
            .map(instrument => {
                const instrumentSummary = missionContext.missionSummary.instrumentsSummary.get(instrument.name)
                if (!instrumentSummary)
                    return null

                return {
                    id: instrument.id,
                    name: instrument.name,
                    version: instrument.version,
                    runningTime: instrumentSummary.runningTime,
                }
            })
            .filter((instrument): instrument is MissionLockfileInstrument => instrument != null),
    }

    const lockFilePath = getMissionLockFilePath()
    fs.writeFileSync(lockFilePath, yaml.dump(lockfile), {flag: 'w'})
    return lockFilePath
}
