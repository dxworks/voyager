import {Instrument} from '../model/Instrument'
import {runCommand} from './command-runner'
import {missionContext} from '../context/mission-context'
import {loadAndParseData} from '../parser/data-parser'
import {packageActionKey, startActionKey} from '../utils/ActionConstants'
import {CustomAction, DefaultAction, Location} from '../model/Action'
import archiver from 'archiver'
import fs from 'fs'
import path from 'node:path'
import {INSTRUMENTS_DIR} from '../context/context-variable-provider'

export function runMission(missionFilePath: string): void {
    let instruments: Instrument[]
    loadAndParseData(missionFilePath)
    if (missionContext.runAll) {
        instruments = missionContext.instruments
    } else {
        instruments = <Instrument[]>missionContext.runnableInstruments.map(runnableInstrument => missionContext.instruments.find((instrument) => instrument.id == runnableInstrument))
            .filter(instrument => !!instrument)
    }

    instruments.forEach(instrument => runInstrument(instrument!))
    packageResults(instruments)
}

function runInstrument(instrument: Instrument): void {
    const startAction: CustomAction = <CustomAction>instrument.actions.get(startActionKey)!
    startAction.commandsContext.forEach((commandContext) => runCommand(commandContext))
}

function packageResults(instruments: Instrument[]): void {
    const archive = archiver('zip', {zlib: {level: 9}})
    instruments.forEach((instrument: Instrument) => {
        const instrumentResultsDirectory = instrument.name
        const locations: Location[] = (<DefaultAction>instrument.actions.get(packageActionKey)).with.locations!
        console.log(locations)
        locations.forEach(location => {
            const destinationDirectory = location.destination ? path.join(instrumentResultsDirectory, location.destination) : instrumentResultsDirectory
            const sourcePath = path.resolve(missionContext.getVariable(INSTRUMENTS_DIR)!, location.source)
            if (location.files) {
                location.files.forEach(file => {
                    const filePath = path.resolve(sourcePath, file)
                    const stat = fs.statSync(filePath)
                    if (stat.isFile()) {
                        archive.file(filePath, {name: path.join(destinationDirectory, file)})
                    }
                })
            } else {
                archive.directory(sourcePath, destinationDirectory)
            }
        })
    })
    archive.finalize().then()
    archive.pipe(fs.createWriteStream('voyager2-results.zip'))
}
