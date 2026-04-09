import {missionContext} from '../../src/context/MissionContext'
import path from 'node:path'
import {cleanupTempDir, makeTempDir} from '../utils/fs-test.utils'
import {resetMissionContext} from '../utils/mission-context.utils'

const loadAndParseDataMock = jest.fn()
const runSummaryActionMock = jest.fn(async (_action: unknown, _instrumentPath: string, _instrumentName: string) => ({
    summaryMdFilePath: null,
    summaryHtmlFilePath: null,
}))

jest.mock('../../src/parser/data-parser', () => ({
    loadAndParseData: (missionPath: string) => loadAndParseDataMock(missionPath),
}))

jest.mock('../../src/runner/default-actions/summary-action-runner', () => ({
    runSummaryAction: (action: unknown, instrumentPath: string, instrumentName: string) =>
        runSummaryActionMock(action, instrumentPath, instrumentName),
}))

const {summaryMission} = require('../../src/runner/mission-runner')

describe('mission runner summary command', () => {
    let tempDir = ''
    let initialCwd = ''

    beforeEach(() => {
        resetMissionContext()
        tempDir = makeTempDir('voyager-summary-mission-runner')
        initialCwd = process.cwd()
        process.chdir(tempDir)
        loadAndParseDataMock.mockReset()
        runSummaryActionMock.mockClear()
    })

    afterEach(() => {
        process.chdir(initialCwd)
        cleanupTempDir(tempDir)
        resetMissionContext()
        jest.restoreAllMocks()
    })

    test('summaryMission should initialize instrument summary before running summary action', async () => {
        const summaryAction = {name: 'summary', commandsContext: []}
        loadAndParseDataMock.mockImplementation(() => {
            missionContext.name = 'summary-mission'
            missionContext.instruments = [
                {
                    id: 'tool',
                    name: 'Tool',
                    version: '1.0.0',
                    instrumentPath: '/tmp/tool',
                    actions: new Map([['summary', summaryAction]]),
                    runOrder: 0,
                },
                {
                    id: 'no-summary-tool',
                    name: 'NoSummaryTool',
                    version: '1.0.0',
                    instrumentPath: '/tmp/no-summary-tool',
                    actions: new Map(),
                    runOrder: 0,
                },
            ]
        })

        await summaryMission(path.join(tempDir, 'mission.yml'))

        expect(runSummaryActionMock).toHaveBeenCalledTimes(1)
        expect(runSummaryActionMock).toHaveBeenCalledWith(summaryAction, '/tmp/tool', 'tool')
        expect(missionContext.missionSummary.getInstrumentSummary('Tool').runningTime).not.toBe('')
        expect(missionContext.missionSummary.getInstrumentSummary('Tool').finishedAt).toMatch(/^\d{2}\.\d{2}\.\d{4} \d{2}:\d{2}$/)
        expect(missionContext.missionSummary.instrumentsSummary.has('NoSummaryTool')).toBe(false)
    })
})
