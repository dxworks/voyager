import {Instrument} from '../model/Instrument'
import yaml from 'js-yaml'
import fs, {readdirSync} from 'fs'
import {parseInstrument} from './instrument-parser'
import {parseMission} from './mission-parser'
import path from 'node:path'
import {missionContext} from '../context/MissionContext'
import {
    INSTRUMENTS_DIR,
    INSTRUMENTS_DIR_DEFAULT_VALUE,
    MISSION_NAME,
    MISSION_ROOT_DIR,
    RESULTS_UNPACK_DIR,
    RESULTS_ZIP_DIR,
    VOYAGER_WORKING_DIR,
} from '../context/context-variable-provider'

const instrumentYml = 'instrument.v2.yml'

const getDirectories = (source: any): string[] =>
    readdirSync(source, {withFileTypes: true})
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name)

function setContextVariables(filePath: string): void {
    const rootDir: string = path.dirname(filePath)
    missionContext.addVariable(MISSION_ROOT_DIR, rootDir)
    addDefaultVariables()
}

function addDefaultVariables() {
    const currentPath = process.cwd()
    missionContext.addVariable(VOYAGER_WORKING_DIR, currentPath)
    missionContext.addVariable(INSTRUMENTS_DIR, path.resolve(<string>missionContext.getVariable(MISSION_ROOT_DIR), INSTRUMENTS_DIR_DEFAULT_VALUE))
}

export function loadAndParseData(filePath: string): void {
    console.log('Start parsing mission data..')
    setContextVariables(filePath)
    loadAndParseMission(filePath)
    loadAndParseInstruments()
    console.log('Data parsing finished successfully!')
}

export function loadAndParseMission(filePath: string): void {
    const file: any = yaml.load(fs.readFileSync(filePath).toString())
    missionContext.name = file.mission
    missionContext.addVariable(MISSION_NAME, file.mission)
    parseIntoMap(file.variables).forEach((value, key) => missionContext.addVariable(key, value))
    if (file.instrumentsDir)
        missionContext.addVariable(INSTRUMENTS_DIR, path.resolve(<string>missionContext.getVariable(MISSION_ROOT_DIR), <string>file.instrumentsDir))
    if (file.runAll)
        missionContext.runAll = file.runAll
    if (file.resultsPath)
        missionContext.addVariable(RESULTS_ZIP_DIR, path.resolve(<string>missionContext.getVariable(MISSION_ROOT_DIR), <string>file.resultsPath))
    if (file.resultsUnpackTarget)
        missionContext.addVariable(RESULTS_UNPACK_DIR, path.resolve(<string>missionContext.getVariable(MISSION_ROOT_DIR), <string>file.resultsUnpackTarget))
    parseMission(file)
}

function loadAndParseInstruments() {
    const instruments: Instrument[] = []
    const instrumentsDirPath = path.resolve(<string>missionContext.getVariable(MISSION_ROOT_DIR), <string>missionContext.getVariable(INSTRUMENTS_DIR))
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