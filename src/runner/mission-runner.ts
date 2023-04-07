import {Instrument} from '../model/Instrument'
import {runCommand} from './command-runner'
import {missionContext} from '../context/mission-context'
import {loadAndParseData} from '../parser/data-parser'
import fs from 'fs'
import path from 'node:path'
import {INSTRUMENTS_DIR} from '../context/context-variable-provider'
import JSZip from 'jszip'

export function runMission(missionFilePath: string): void {
    let instruments: Instrument[]
    loadAndParseData(missionFilePath)
    if (missionContext.runAll) {
        instruments = missionContext.instruments
        instruments.forEach((instrument) => runInstrument(instrument))
    } else {
        instruments = <Instrument[]>missionContext.runnableInstruments.map(runnableInstrument => missionContext.instruments.find((instrument) => instrument.id == runnableInstrument))
            .filter(instrument => !!instrument)
        instruments.forEach(instrument => runInstrument(instrument!))
    }
    packageResults(instruments)
}

function runInstrument(instrument: Instrument): void {
    instrument.actions.forEach((action) => {
        action.commandsContext.forEach((commandContext) => runCommand(commandContext))
    })
}

function packageResults(instruments: Instrument[]): void {
    const zip = new JSZip()
    instruments.forEach((instrument: Instrument) => {
        if (instrument.results.dir) {
            console.log(instrument.results.dir)
            const instrumentResultContent = fs.readFileSync(path.resolve(missionContext.getVariable(INSTRUMENTS_DIR)!, instrument.name, instrument.results.dir, 'success.txt'))
            zip.file(instrument.name, instrumentResultContent)
        }
    })
    zip.generateNodeStream().pipe(fs.createWriteStream('results.zip'))
}
