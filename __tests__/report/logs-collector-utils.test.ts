import fs from 'fs'
import path from 'node:path'

import {missionContext} from '../../src/context/MissionContext'
import {VOYAGER_WORKING_DIR} from '../../src/context/context-variable-provider'
import {getLogFilePath, getLogsStream, getTimeInSeconds} from '../../src/report/logs-collector-utils'
import {cleanupTempDir, makeTempDir} from '../utils/fs-test.utils'
import {resetMissionContext} from '../utils/mission-context.utils'

describe('logs collector utils', () => {
    let tempDir = ''
    let originalLog: (...args: any[]) => void
    let originalError: (...args: any[]) => void

    beforeEach(() => {
        resetMissionContext()
        tempDir = makeTempDir('voyager-logs-utils')
        missionContext.name = 'DemoMission'
        missionContext.addVariable(VOYAGER_WORKING_DIR, tempDir)
        originalLog = console.log
        originalError = console.error
    })

    afterEach(() => {
        if (missionContext.logsStream)
            missionContext.logsStream.close()
        console.log = originalLog
        console.error = originalError
        cleanupTempDir(tempDir)
        resetMissionContext()
    })

    test('getLogFilePath should resolve under voyager working dir', () => {
        const logPath = getLogFilePath('ToolA')

        expect(logPath).toBe(path.join(tempDir, 'ToolA.log'))
    })

    test('getLogsStream should append log and error output to mission log file', async () => {
        missionContext.logsStream = getLogsStream()

        console.log('line one')
        console.error('line two')
        await new Promise<void>(resolve => {
            missionContext.logsStream!.end(() => resolve())
        })

        const logPath = getLogFilePath('DemoMission')
        const content = fs.readFileSync(logPath).toString()
        expect(content).toContain('line one')
        expect(content).toContain('Error: line two')
    })

    test('getTimeInSeconds should format with one decimal and suffix', () => {
        const duration = getTimeInSeconds(0, 1530)

        expect(duration).toBe('1.5s')
    })
})
