import {Instrument} from '../model/Instrument'
import yaml from 'js-yaml'
import fs, {readdirSync} from 'fs'
import {parseInstrument} from './instrument-parser'
import {parseMission} from './mission-parser'
import {variableHandler} from '../variable/variable-handler'
import path from 'node:path'
import {INSTRUMENTS_DIR, VOYAGER_DIR} from '../variable/key-constants'
import {missionContext} from '../context/mission-context'

const instrumentYml = 'instrument.yml'

const getDirectories = (source: any): string[] =>
    readdirSync(source, {withFileTypes: true})
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name)

export function loadAndParseData(filePath: string): void {
    const voyagerDir: string = path.dirname(filePath)
    variableHandler.variableProvider.addVariable(VOYAGER_DIR, voyagerDir) //TODO move variable provider to missionContext
    loadAndParseMission(filePath)
    const instruments: Instrument[] = []
    const instrumentsDir = path.resolve(<string>variableHandler.variableProvider.getVariable(VOYAGER_DIR), <string>variableHandler.variableProvider.getVariable(INSTRUMENTS_DIR))
    const instrumentDirectories = getDirectories(instrumentsDir)
    instrumentDirectories.forEach((instrumentDir) => {
        instruments.push(loadAndParseInstrument(path.resolve(instrumentsDir, instrumentDir, instrumentYml)))
    })
    missionContext.setInstruments(instruments)
    console.log({
        instruments,
    })
}

export function loadAndParseMission(filePath: string): void {
    const file: any = yaml.load(fs.readFileSync(filePath).toString())
    variableHandler.variableProvider.addVariables(parseIntoMap(file.variables))
    if (file.instrumentsDir)
        variableHandler.variableProvider.addVariable(INSTRUMENTS_DIR, file.instrumentsDir)
    if (file.runAll) {
        missionContext.runAll = file.runAll
    }
    parseMission(file)
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