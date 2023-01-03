import {Instrument} from '../model/Instrument'
import yaml from 'js-yaml'
import fs, {readdirSync} from 'fs'
import {parseInstrument} from './instrument-parser'
import {parseMission} from './mission-parser'
import path from 'node:path'
import {missionContext} from '../context/mission-context'
import {INSTRUMENTS_DIR, ROOT_DIR} from '../context/context-variable-provider'

const instrumentYml = 'instrument.yml'

const getDirectories = (source: any): string[] =>
    readdirSync(source, {withFileTypes: true})
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name)

export function loadAndParseData(filePath: string): void {
    const rootDir: string = path.dirname(filePath)
    missionContext.addVariable(ROOT_DIR, rootDir)
    missionContext.addVariable(INSTRUMENTS_DIR, path.resolve(<string>missionContext.getVariable(ROOT_DIR), <string>missionContext.getVariable(INSTRUMENTS_DIR)))
    loadAndParseMission(filePath)
    loadAndParseInstruments()
}

export function loadAndParseMission(filePath: string): void {
    const file: any = yaml.load(fs.readFileSync(filePath).toString())
    parseIntoMap(file.variables).forEach((value, key) => missionContext.addVariable(key, value))
    if (file.instrumentsDir)
        missionContext.addVariable(INSTRUMENTS_DIR, path.resolve(<string>missionContext.getVariable(ROOT_DIR), <string>missionContext.getVariable(file.instrumentsDir)))
    if (file.runAll) {
        missionContext.runAll = file.runAll
    }
    parseMission(file)
}

function loadAndParseInstruments() {
    const instruments: Instrument[] = []
    const instrumentsDir = <string>missionContext.getVariable(INSTRUMENTS_DIR)
    const instrumentDirectories = getDirectories(instrumentsDir)
    instrumentDirectories.forEach((instrumentDir) => {
        instruments.push(loadAndParseInstrument(path.resolve(instrumentsDir, instrumentDir, instrumentYml)))
    })
    missionContext.instruments = instruments
}

export function loadAndParseInstrument(filePath: string): Instrument {
    const file = yaml.load(fs.readFileSync(filePath).toString())
    return parseInstrument(file)
}

export function parseIntoMap(object?: Record<string, unknown>): Map<string, any> {
    if (object)
        return new Map(Object.entries(object))
    return new Map()
}