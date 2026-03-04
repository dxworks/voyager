import fs from 'fs'
import path from 'node:path'

import {missionContext} from '../../src/context/MissionContext'
import {VOYAGER_WORKING_DIR} from '../../src/context/context-variable-provider'
import {InstrumentSummary} from '../../src/model/summary/InstrumentSummary'
import {runCommand, translateCommand} from '../../src/runner/command-runner'
import {getLogFilePath} from '../../src/report/logs-collector-utils'
import {cleanupTempDir, makeTempDir} from '../utils/fs-test.utils'
import {resetMissionContext} from '../utils/mission-context.utils'

describe('command runner robustness', () => {
    let tempDir = ''

    beforeEach(() => {
        resetMissionContext()
        tempDir = makeTempDir('voyager-command-robust')
        missionContext.addVariable(VOYAGER_WORKING_DIR, tempDir)
        missionContext.missionSummary.addInstrumentSummary('Tool', new InstrumentSummary())
    })

    afterEach(() => {
        cleanupTempDir(tempDir)
        resetMissionContext()
    })

    test('translateCommand should choose command variant for current platform', () => {
        if (process.platform === 'win32')
            expect(translateCommand({windows: 'win'})).toBe('win')
        else if (process.platform === 'linux')
            expect(translateCommand({unix: 'unix'})).toBe('unix')
        else if (process.platform === 'darwin')
            expect(translateCommand({unix: 'unix'})).toBe('unix')
    })

    test('runCommand should fail gracefully when command is missing for current platform', async () => {
        await runCommand({
            id: 'missing-platform',
            command: {linux: 'echo linux-only'},
        }, tempDir, 'Tool')

        const summary = missionContext.missionSummary.getInstrumentSummary('Tool').commandsSummary.get('missing-platform')
        expect(summary!.success).toBe(false)
    })

    test('runCommand should mark failure and write logs when cwd does not exist', async () => {
        await runCommand({
            id: 'invalid-cwd',
            command: 'node -e "console.log(\'should-not-run\')"',
        }, path.join(tempDir, 'missing-dir'), 'Tool')

        const summary = missionContext.missionSummary.getInstrumentSummary('Tool').commandsSummary.get('invalid-cwd')
        expect(summary!.success).toBe(false)

        const logContent = fs.readFileSync(getLogFilePath('Tool')).toString()
        expect(logContent.length).toBeGreaterThan(0)
    })

    test('runCommand should capture stderr output and still succeed on exit 0', async () => {
        await runCommand({
            id: 'stderr',
            command: 'node -e "console.error(\'stderr-line\'); process.exit(0)"',
        }, tempDir, 'Tool')

        const summary = missionContext.missionSummary.getInstrumentSummary('Tool').commandsSummary.get('stderr')
        expect(summary!.success).toBe(true)
        const logContent = fs.readFileSync(getLogFilePath('Tool')).toString()
        expect(logContent).toContain('stderr-line')
    })

    test('runCommand should create instrument summary when missing', async () => {
        missionContext.missionSummary.instrumentsSummary.delete('MissingTool')

        await runCommand({
            id: 'auto-create-summary',
            command: 'node -e "process.exit(0)"',
        }, tempDir, 'MissingTool')

        const createdInstrumentSummary = missionContext.missionSummary.getInstrumentSummary('MissingTool')
        expect(createdInstrumentSummary).toBeDefined()
        expect(createdInstrumentSummary.commandsSummary.get('auto-create-summary')!.success).toBe(true)
    })
})
