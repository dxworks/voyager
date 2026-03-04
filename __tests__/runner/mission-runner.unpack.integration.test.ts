import fs from 'fs'
import path from 'node:path'

import AdmZip from 'adm-zip'
import {unpackMission} from '../../src/runner/mission-runner'
import {cleanupTempDir, makeTempDir, writeYaml} from '../utils/fs-test.utils'
import {resetMissionContext} from '../utils/mission-context.utils'

function createResultsZip(zipPath: string, missionName: string): void {
    const zip = new AdmZip()
    zip.addFile('mission.yml', Buffer.from(`mission: ${missionName}\n`))
    zip.addFile('data/report.txt', Buffer.from('report-content'))
    zip.writeZip(zipPath)
}

function createUnpackMission(missionFilePath: string, targetZipPath: string, destinationPath: string, missionNameInZipFile?: boolean, includeMapping = true): void {
    writeYaml(missionFilePath, {
        mission: 'unpack-mission',
        target: targetZipPath,
        missionNameInZipFile,
        instrumentsDir: './instruments',
        mapping: includeMapping
            ? {
                Tool: {
                    reportItem: {
                        source: 'report',
                        destination: destinationPath,
                        prefix: '${initialMissionName}',
                    },
                },
            }
            : undefined,
    })
}

function createUnpackInstrument(instrumentPath: string): void {
    writeYaml(instrumentPath, {
        id: 'tool-id',
        name: 'Tool',
        version: '1.0.0',
        actions: {
            unpack: {
                produces: {
                    report: 'data/report.txt',
                },
            },
        },
    })
}

describe('mission runner unpack integration', () => {
    let tempDir = ''
    let initialCwd = ''

    beforeEach(() => {
        resetMissionContext()
        tempDir = makeTempDir('voyager-unpack-integration')
        initialCwd = process.cwd()
        process.chdir(tempDir)
    })

    afterEach(() => {
        process.chdir(initialCwd)
        cleanupTempDir(tempDir)
        resetMissionContext()
        jest.restoreAllMocks()
    })

    test('unpackMission should fallback to TARGET and use archive name prefix when missionNameInZipFile is true', () => {
        const zipPath = path.join(tempDir, 'external.zip')
        createResultsZip(zipPath, 'inside-name')

        const instrumentsDir = path.join(tempDir, 'instruments', 'tool')
        fs.mkdirSync(instrumentsDir, {recursive: true})
        createUnpackInstrument(path.join(instrumentsDir, 'instrument.v2.yml'))

        const destination = path.join(tempDir, 'unpacked-output')
        const missionFilePath = path.join(tempDir, 'mission.yml')
        createUnpackMission(missionFilePath, zipPath, destination, true, true)

        unpackMission(missionFilePath)

        expect(fs.existsSync(path.join(destination, 'external-report.txt'))).toBe(true)
    })

    test('unpackMission should use mission name from archive content when missionNameInZipFile is false', () => {
        const zipPath = path.join(tempDir, 'external.zip')
        createResultsZip(zipPath, 'inside-name')

        const instrumentsDir = path.join(tempDir, 'instruments', 'tool')
        fs.mkdirSync(instrumentsDir, {recursive: true})
        createUnpackInstrument(path.join(instrumentsDir, 'instrument.v2.yml'))

        const destination = path.join(tempDir, 'unpacked-output')
        const missionFilePath = path.join(tempDir, 'mission.yml')
        createUnpackMission(missionFilePath, zipPath, destination, false, true)

        unpackMission(missionFilePath)

        expect(fs.existsSync(path.join(destination, 'inside-name-report.txt'))).toBe(true)
    })

    test('unpackMission should warn and stop when mapping is empty', () => {
        const warnSpy = jest.spyOn(console, 'warn').mockImplementation()
        const zipPath = path.join(tempDir, 'external.zip')
        createResultsZip(zipPath, 'inside-name')

        const instrumentsDir = path.join(tempDir, 'instruments', 'tool')
        fs.mkdirSync(instrumentsDir, {recursive: true})
        createUnpackInstrument(path.join(instrumentsDir, 'instrument.v2.yml'))

        const destination = path.join(tempDir, 'unpacked-output')
        const missionFilePath = path.join(tempDir, 'mission.yml')
        createUnpackMission(missionFilePath, zipPath, destination, true, false)

        unpackMission(missionFilePath)

        expect(warnSpy).toHaveBeenCalledWith('The mission unpack-mission does not contain mapping.')
        expect(fs.existsSync(destination)).toBe(false)
    })
})
