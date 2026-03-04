import fs from 'fs'
import path from 'node:path'

import {missionContext} from '../../src/context/MissionContext'
import {INSTRUMENTS_DIR, RESULTS_UNPACK_DIR, VOYAGER_WORKING_DIR} from '../../src/context/context-variable-provider'
import {DefaultAction} from '../../src/model/Action'
import {InstrumentSummary} from '../../src/model/summary/InstrumentSummary'
import {runAction} from '../../src/runner/action-runner'
import {verifyActionKey} from '../../src/runner/action-utils'
import {FakeArchive} from '../utils/archive-fake.utils'
import {cleanupTempDir, makeTempDir} from '../utils/fs-test.utils'
import {resetMissionContext} from '../utils/mission-context.utils'

describe('action runner', () => {
    let tempDir = ''

    beforeEach(() => {
        resetMissionContext()
        tempDir = makeTempDir('voyager-action-runner')
        missionContext.addVariable(INSTRUMENTS_DIR, tempDir)
        missionContext.addVariable(RESULTS_UNPACK_DIR, tempDir)
        missionContext.addVariable(VOYAGER_WORKING_DIR, tempDir)
        missionContext.missionSummary.addInstrumentSummary('tool', new InstrumentSummary())
    })

    afterEach(() => {
        cleanupTempDir(tempDir)
        resetMissionContext()
    })

    test('custom action should use instrument path when command dir is missing', async () => {
        const instrumentPath = path.join(tempDir, 'instrument')
        fs.mkdirSync(instrumentPath)

        await runAction({
            name: 'start',
            commandsContext: [
                {
                    id: 'first',
                    command: 'node -e "require(\'fs\').writeFileSync(\'from-instrument.txt\',\'ok\')"',
                },
            ],
        }, null, instrumentPath, 'tool')

        expect(fs.existsSync(path.join(instrumentPath, 'from-instrument.txt'))).toBe(true)
    })

    test('custom action should use command dir when provided', async () => {
        const instrumentPath = path.join(tempDir, 'instrument')
        const commandPath = path.join(tempDir, 'command-dir')
        fs.mkdirSync(instrumentPath)
        fs.mkdirSync(commandPath)

        await runAction({
            name: 'start',
            commandsContext: [
                {
                    id: 'first',
                    dir: commandPath,
                    command: 'node -e "require(\'fs\').writeFileSync(\'from-command.txt\',\'ok\')"',
                },
            ],
        }, null, instrumentPath, 'tool')

        expect(fs.existsSync(path.join(commandPath, 'from-command.txt'))).toBe(true)
    })

    test('default package action should add files to archive', async () => {
        const sourceDir = path.join(tempDir, 'reports')
        fs.mkdirSync(sourceDir)
        fs.writeFileSync(path.join(sourceDir, 'result.json'), '{"ok":true}')
        const archive = new FakeArchive()
        const action = <DefaultAction>{
            name: 'pack',
            with: {
                locations: [
                    {
                        source: 'reports',
                        destination: 'out',
                    },
                ],
            },
        }

        await runAction(action, <any>archive, tempDir, 'tool')

        expect(archive.directories.length).toBe(1)
        expect(archive.directories[0].destination).toBe(path.join('tool', 'out'))
    })

    test('default verify action should create doctor report entry', async () => {
        const action = <DefaultAction>{
            name: verifyActionKey,
            with: {
                requirements: [
                    {
                        name: 'node',
                        min: '1.0.0',
                        match: ['(?<version>.+)'],
                        command: 'node -e "console.log(\'1.0.0\')"',
                    },
                ],
            },
        }

        await runAction(action, null, tempDir, 'tool')

        expect(missionContext.doctorReport.instrumentsDoctorReport.length).toBe(1)
        expect(missionContext.doctorReport.instrumentsDoctorReport[0].instrumentName).toBe('tool')
    })
})
