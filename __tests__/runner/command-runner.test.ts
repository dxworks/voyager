import fs from 'fs'
import path from 'node:path'

import {missionContext} from '../../src/context/MissionContext'
import {VOYAGER_WORKING_DIR} from '../../src/context/context-variable-provider'
import {InstrumentSummary} from '../../src/model/summary/InstrumentSummary'
import {runCommand} from '../../src/runner/command-runner'
import {getLogFilePath} from '../../src/report/logs-collector-utils'
import {cleanupTempDir, makeTempDir} from '../utils/fs-test.utils'
import {resetMissionContext} from '../utils/mission-context.utils'

describe('command runner', () => {
    let tempDir = ''

    beforeEach(() => {
        resetMissionContext()
        tempDir = makeTempDir('voyager-command-runner')
        missionContext.addVariable(VOYAGER_WORKING_DIR, tempDir)
        missionContext.missionSummary.addInstrumentSummary('tool', new InstrumentSummary())
    })

    afterEach(() => {
        cleanupTempDir(tempDir)
        resetMissionContext()
    })

    test('runCommand should mark command as successful for exit code 0', async () => {
        await runCommand({
            id: 'ok',
            command: 'node -e "process.exit(0)"',
        }, tempDir, 'tool')

        const summary = missionContext.missionSummary.getInstrumentSummary('tool').commandsSummary.get('ok')
        expect(summary!.success).toBe(true)
    })

    test('runCommand should allow configured non-zero valid exit codes', async () => {
        await runCommand({
            id: 'allowed',
            command: 'node -e "process.exit(2)"',
            with: {validExitCodes: [2]},
        }, tempDir, 'tool')

        const summary = missionContext.missionSummary.getInstrumentSummary('tool').commandsSummary.get('allowed')
        expect(summary!.success).toBe(true)
    })

    test('runCommand should mark command as failed for invalid exit code', async () => {
        await runCommand({
            id: 'fail',
            command: 'node -e "process.exit(3)"',
        }, tempDir, 'tool')

        const summary = missionContext.missionSummary.getInstrumentSummary('tool').commandsSummary.get('fail')
        expect(summary!.success).toBe(false)
    })

    test('runCommand should write stdout to log file and mission stream', async () => {
        const missionLogPath = path.join(tempDir, 'mission.log')
        missionContext.logsStream = fs.createWriteStream(missionLogPath, {flags: 'a'})

        await runCommand({
            id: 'logs',
            command: 'node -e "console.log(\'hello-log\')"',
        }, tempDir, 'tool')

        missionContext.logsStream.close()

        const instrumentLogContent = fs.readFileSync(getLogFilePath('tool')).toString()
        expect(instrumentLogContent).toContain('hello-log')

        const missionLogContent = fs.readFileSync(missionLogPath).toString()
        expect(missionLogContent).toContain('hello-log')
    })
})
