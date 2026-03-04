import fs from 'fs-extra'
import path from 'node:path'

import AdmZip from 'adm-zip'
import {cleanupTempDir, makeTempDir} from '../utils/fs-test.utils'

const execMock = jest.fn((command: string, callback: (error: Error | null) => void) => callback(null))

jest.mock('node:child_process', () => ({
    exec: (command: string, callback: (error: Error | null) => void) => execMock(command, callback),
}))

const {buildAndOpenLegacySummary, openMissionSummary} = require('../../src/runner/mission-summary-runner')

describe('mission summary runner', () => {
    let tempDir = ''
    let initialCwd = ''

    beforeEach(() => {
        tempDir = makeTempDir('voyager-mission-summary-runner')
        initialCwd = process.cwd()
        process.chdir(tempDir)
        execMock.mockClear()
    })

    afterEach(() => {
        process.chdir(initialCwd)
        cleanupTempDir(tempDir)
        jest.restoreAllMocks()
    })

    test('openMissionSummary should log error when MissionReport.html is missing', () => {
        const zipPath = path.join(tempDir, 'report.zip')
        const zip = new AdmZip()
        zip.addFile('some.log', Buffer.from('data'))
        zip.writeZip(zipPath)
        const errorSpy = jest.spyOn(console, 'error').mockImplementation()

        openMissionSummary(zipPath)

        expect(errorSpy).toHaveBeenCalledWith('No HTML file found in the zip.')
        expect(execMock).not.toHaveBeenCalled()
    })

    test('openMissionSummary should extract mission html and open it', () => {
        const zipPath = path.join(tempDir, 'report.zip')
        const zip = new AdmZip()
        zip.addFile('MissionReport.html', Buffer.from('<html>report</html>'))
        zip.addFile('html/tool.html', Buffer.from('<html>tool</html>'))
        zip.writeZip(zipPath)

        openMissionSummary(zipPath)

        expect(execMock).toHaveBeenCalledTimes(1)
    })

    test('buildAndOpenLegacySummary should log error when mission report log is missing', () => {
        const zipPath = path.join(tempDir, 'legacy.zip')
        const zip = new AdmZip()
        zip.addFile('tool.log', Buffer.from('tool logs'))
        zip.writeZip(zipPath)
        const errorSpy = jest.spyOn(console, 'error').mockImplementation()

        buildAndOpenLegacySummary(zipPath)

        expect(errorSpy).toHaveBeenCalledWith('Text report file not found in the zip archive.')
        expect(execMock).not.toHaveBeenCalled()
    })

    test('buildAndOpenLegacySummary should generate mission summary folder and html files', () => {
        const zipPath = path.join(tempDir, 'legacy.zip')
        const zip = new AdmZip()
        const missionLog = [
            'Starting mission SampleMission',
            '------------------- Mission Summary -------------------',
            '-------- ToolA --------',
            'Scan .... SUCCESS [ 0.1 s ]',
            '------ end ToolA ------',
            'Elapsed time: 0.2 s',
            '------------------- end Mission Summary -------------------',
            '_______________________container_______________________',
        ].join('\n')
        zip.addFile('mission-report.log', Buffer.from(missionLog))
        zip.addFile('toolA.log', Buffer.from('tool a log'))
        zip.writeZip(zipPath)

        buildAndOpenLegacySummary(zipPath)

        expect(fs.existsSync(path.resolve('./mission_summary/MissionReport.html'))).toBe(true)
        expect(fs.existsSync(path.resolve('./mission_summary/html/toolA.html'))).toBe(true)
        expect(execMock).toHaveBeenCalledTimes(1)
    })
})
