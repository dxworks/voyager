import fs from 'fs'
import path from 'node:path'

import {missionContext} from '../../src/context/MissionContext'
import {INSTRUMENTS_DIR, VOYAGER_WORKING_DIR} from '../../src/context/context-variable-provider'
import {Instrument} from '../../src/model/Instrument'
import {runInstrument} from '../../src/runner/instrument-runner'
import {FakeArchive} from '../utils/archive-fake.utils'
import {cleanupTempDir, makeTempDir} from '../utils/fs-test.utils'
import {resetMissionContext} from '../utils/mission-context.utils'

describe('instrument runner', () => {
    let tempDir = ''

    beforeEach(() => {
        resetMissionContext()
        tempDir = makeTempDir('voyager-instrument-runner')
        missionContext.addVariable(INSTRUMENTS_DIR, tempDir)
        missionContext.addVariable(VOYAGER_WORKING_DIR, tempDir)
    })

    afterEach(() => {
        cleanupTempDir(tempDir)
        resetMissionContext()
    })

    test('default run should execute start and optional pack action', async () => {
        const instrumentPath = path.join(tempDir, 'tool')
        const reportsPath = path.join(tempDir, 'reports')
        fs.mkdirSync(instrumentPath)
        fs.mkdirSync(reportsPath)
        fs.writeFileSync(path.join(reportsPath, 'result.txt'), 'ok')

        const instrument: Instrument = {
            id: 'tool',
            name: 'Tool',
            version: '1.0.0',
            instrumentPath,
            runOrder: 0,
            actions: new Map([
                ['start', {
                    name: 'start',
                    commandsContext: [{id: 'start', command: 'node -e "process.exit(0)"'}],
                }],
                ['pack', {
                    name: 'pack',
                    with: {
                        locations: [<any>{source: 'reports', destination: 'bundle'}],
                    },
                }],
            ]),
        }

        const archive = new FakeArchive()
        await runInstrument(instrument, <any>archive, false)

        expect(missionContext.missionSummary.getInstrumentSummary('Tool')).toBeDefined()
        expect(archive.directories.length).toBe(1)
    })

    test('custom run should execute only selected actions', async () => {
        const instrumentPath = path.join(tempDir, 'tool')
        fs.mkdirSync(instrumentPath)

        const instrument: Instrument = {
            id: 'tool',
            name: 'Tool',
            version: '1.0.0',
            instrumentPath,
            runOrder: 0,
            actions: new Map([
                ['start', {
                    name: 'start',
                    commandsContext: [{id: 'start', command: 'node -e "require(\'fs\').writeFileSync(\'start.txt\',\'1\')"'}],
                }],
                ['custom', {
                    name: 'custom',
                    commandsContext: [{id: 'custom', command: 'node -e "require(\'fs\').writeFileSync(\'custom.txt\',\'1\')"'}],
                }],
            ]),
        }

        await runInstrument(instrument, null, true, ['custom'])

        expect(fs.existsSync(path.join(instrumentPath, 'custom.txt'))).toBe(true)
        expect(fs.existsSync(path.join(instrumentPath, 'start.txt'))).toBe(false)
    })

    test('default run should skip when start action is missing', async () => {
        const instrumentPath = path.join(tempDir, 'tool')
        const reportsPath = path.join(tempDir, 'reports')
        fs.mkdirSync(instrumentPath)
        fs.mkdirSync(reportsPath)
        fs.writeFileSync(path.join(reportsPath, 'result.txt'), 'ok')

        const instrument: Instrument = {
            id: 'tool',
            name: 'Tool',
            version: '1.0.0',
            instrumentPath,
            runOrder: 0,
            actions: new Map([
                ['pack', {
                    name: 'pack',
                    with: {
                        locations: [<any>{source: 'reports', destination: 'bundle'}],
                    },
                }],
            ]),
        }

        const warnSpy = jest.spyOn(console, 'warn').mockImplementation()
        const archive = new FakeArchive()

        await runInstrument(instrument, <any>archive, false)

        expect(warnSpy).toHaveBeenCalledWith("Instrument Tool: no 'start' action found. Skipping run phase.")
        expect(missionContext.missionSummary.getInstrumentSummary('Tool')).toBeDefined()
        expect(archive.directories.length).toBe(1)

        warnSpy.mockRestore()
    })
})
