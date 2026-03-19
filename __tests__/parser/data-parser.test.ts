import fs from 'fs'
import path from 'node:path'

import {missionContext} from '../../src/context/MissionContext'
import {INSTRUMENTS_DIR, MISSION_ROOT_DIR, RESULTS_UNPACK_DIR, RESULTS_ZIP_DIR} from '../../src/context/context-variable-provider'
import {loadAndParseData, loadAndParseMission, parseIntoMap} from '../../src/parser/data-parser'
import {cleanupTempDir, makeTempDir, writeYaml} from '../utils/fs-test.utils'
import {resetMissionContext} from '../utils/mission-context.utils'

describe('data parser', () => {
    let tempDir = ''

    beforeEach(() => {
        resetMissionContext()
        tempDir = makeTempDir('voyager-data-parser')
    })

    afterEach(() => {
        cleanupTempDir(tempDir)
        resetMissionContext()
    })

    test('parseIntoMap should return empty map for undefined input', () => {
        const result = parseIntoMap(undefined)

        expect(result.size).toBe(0)
    })

    test('parseIntoMap should convert object entries into map', () => {
        const result = parseIntoMap({a: '1', b: '2'})

        expect(result.get('a')).toBe('1')
        expect(result.get('b')).toBe('2')
    })

    test('loadAndParseMission should set default mission variables', () => {
        const missionFilePath = path.join(tempDir, 'mission.yml')
        writeYaml(missionFilePath, {mission: 'alpha'})
        missionContext.addVariable(MISSION_ROOT_DIR, tempDir)

        loadAndParseMission(missionFilePath)

        expect(missionContext.name).toBe('alpha')
        expect(missionContext.getVariable(RESULTS_ZIP_DIR)).toBe('./alpha-voyager-results.zip')
        expect(missionContext.getVariable(RESULTS_UNPACK_DIR)).toBe('./alpha-voyager-results')
    })

    test('loadAndParseMission should override paths from mission yaml', () => {
        const missionFilePath = path.join(tempDir, 'mission.yml')
        writeYaml(missionFilePath, {
            mission: 'beta',
            instrumentsDir: './my-tools',
            resultsPath: './out/results.zip',
            resultsUnpackTarget: './out/unpack',
        })
        missionContext.addVariable(MISSION_ROOT_DIR, tempDir)

        loadAndParseMission(missionFilePath)

        expect(missionContext.getVariable(INSTRUMENTS_DIR)).toBe(path.resolve(tempDir, './my-tools'))
        expect(missionContext.getVariable(RESULTS_ZIP_DIR)).toBe(path.resolve(tempDir, './out/results.zip'))
        expect(missionContext.getVariable(RESULTS_UNPACK_DIR)).toBe(path.resolve(tempDir, './out/unpack'))
    })

    test('loadAndParseMission should respect runAll false', () => {
        const missionFilePath = path.join(tempDir, 'mission.yml')
        writeYaml(missionFilePath, {
            mission: 'beta',
            runAll: false,
            instruments: {
                alpha: {actions: {}},
                beta: {actions: {}},
            },
        })
        missionContext.addVariable(MISSION_ROOT_DIR, tempDir)

        loadAndParseMission(missionFilePath)

        expect(missionContext.runAll).toBe(false)
        expect(missionContext.runnableInstruments).toEqual(['alpha', 'beta'])
    })

    test('loadAndParseMission should support runsAll alias', () => {
        const missionFilePath = path.join(tempDir, 'mission.yml')
        writeYaml(missionFilePath, {
            mission: 'beta',
            runsAll: false,
            instruments: {
                alpha: {actions: {}},
            },
        })
        missionContext.addVariable(MISSION_ROOT_DIR, tempDir)

        loadAndParseMission(missionFilePath)

        expect(missionContext.runAll).toBe(false)
        expect(missionContext.runnableInstruments).toEqual(['alpha'])
    })

    test('loadAndParseData should sort instruments by runOrder then by name and skip missing yaml', () => {
        const instrumentsDir = path.join(tempDir, 'instruments')
        fs.mkdirSync(path.join(instrumentsDir, 'alpha'), {recursive: true})
        fs.mkdirSync(path.join(instrumentsDir, 'beta'), {recursive: true})
        fs.mkdirSync(path.join(instrumentsDir, 'missing-yaml'), {recursive: true})

        writeYaml(path.join(instrumentsDir, 'alpha', 'instrument.v2.yml'), {
            id: 'a',
            name: 'Alpha',
            version: '1.0.0',
            runOrder: 1,
            actions: {start: {commands: {first: {id: 'first', command: 'node -e ""'}}}},
        })
        writeYaml(path.join(instrumentsDir, 'beta', 'instrument.v2.yml'), {
            id: 'b',
            name: 'Beta',
            version: '1.0.0',
            runOrder: 1,
            actions: {start: {commands: {first: {id: 'first', command: 'node -e ""'}}}},
        })

        const missionFilePath = path.join(tempDir, 'mission.yml')
        writeYaml(missionFilePath, {
            mission: 'gamma',
            instrumentsDir: './instruments',
        })

        loadAndParseData(missionFilePath)

        expect(missionContext.instruments.map(instrument => instrument.name)).toEqual(['Alpha', 'Beta'])
        expect(missionContext.instruments.length).toBe(2)
    })
})
