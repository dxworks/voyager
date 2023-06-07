import {Instrument} from '../model/Instrument'
import yaml from 'js-yaml'
import fs, {readdirSync} from 'fs'
import {parseInstrument} from './instrument-parser'
import {parseMission} from './mission-parser'
import path from 'node:path'
import {missionContext} from '../context/MissionContext'
import {INSTRUMENTS_DEFAULT_DIR, INSTRUMENTS_DIR, ROOT_DIR, VOYAGER_DIR} from '../context/context-variable-provider'

const instrumentYml = 'instrument.v2.yml'

const getDirectories = (source: any): string[] =>
    readdirSync(source, {withFileTypes: true})
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name)

export function loadAndParseData(filePath: string): void {
    const rootDir: string = path.dirname(filePath)
    missionContext.addVariable(ROOT_DIR, rootDir)
    const currentPath = process.cwd()
    missionContext.addVariable(VOYAGER_DIR, currentPath)
    missionContext.addVariable(INSTRUMENTS_DIR, path.resolve(rootDir, INSTRUMENTS_DEFAULT_DIR))
    loadAndParseMission(filePath)
    loadAndParseInstruments()
}

export function loadAndParseMission(filePath: string): void {
    const file: any = yaml.load(fs.readFileSync(filePath).toString())
    missionContext.name = file.mission
    parseIntoMap(file.variables).forEach((value, key) => missionContext.addVariable(key, value))
    if (file.instrumentsDir)
        missionContext.addVariable(INSTRUMENTS_DIR, path.resolve(<string>missionContext.getVariable(ROOT_DIR), <string>file.instrumentsDir))
    if (file.runAll)
        missionContext.runAll = file.runAll
    parseMission(file)
}

function loadAndParseInstruments() {
    const instruments: Instrument[] = []
    const instrumentsDirPath = path.resolve(<string>missionContext.getVariable(ROOT_DIR), <string>missionContext.getVariable(INSTRUMENTS_DIR))
    const instrumentDirectories = getDirectories(instrumentsDirPath)
    instrumentDirectories.forEach((instrumentDir) => {
        instruments.push(loadAndParseInstrument(instrumentsDirPath, instrumentDir))
    })
    missionContext.instruments = instruments
}

export function loadAndParseInstrument(instrumentsDirPath: string, instrumentDir: string): Instrument {
    const file = yaml.load(fs.readFileSync(path.resolve(instrumentsDirPath, instrumentDir, instrumentYml)).toString())
    return parseInstrument(instrumentsDirPath, instrumentDir, file)
}

export function parseIntoMap(object?: Record<string, unknown>): Map<string, any> {
    if (object)
        return new Map(Object.entries(object))
    return new Map()
}