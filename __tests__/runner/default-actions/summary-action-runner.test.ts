import fs from 'fs'
import path from 'node:path'

import {missionContext} from '../../../src/context/MissionContext'
import {VOYAGER_WORKING_DIR} from '../../../src/context/context-variable-provider'
import {InstrumentSummary} from '../../../src/model/summary/InstrumentSummary'
import {runSummaryAction} from '../../../src/runner/default-actions/summary-action-runner'
import {cleanupTempDir, makeTempDir} from '../../utils/fs-test.utils'
import {resetMissionContext} from '../../utils/mission-context.utils'

describe('summary action runner', () => {
    let tempDir = ''

    beforeEach(() => {
        resetMissionContext()
        tempDir = makeTempDir('voyager-summary-action')
        missionContext.addVariable(VOYAGER_WORKING_DIR, tempDir)
    })

    afterEach(() => {
        cleanupTempDir(tempDir)
        resetMissionContext()
        jest.restoreAllMocks()
    })

    test('should return existing summary files and skip command execution', async () => {
        const instrumentPath = path.join(tempDir, 'tool')
        fs.mkdirSync(path.join(instrumentPath, 'summary'), {recursive: true})
        fs.writeFileSync(path.join(instrumentPath, 'summary', 'summary.md'), '# summary')
        fs.writeFileSync(path.join(instrumentPath, 'summary', 'summary.html'), '<h1>summary</h1>')
        missionContext.missionSummary.addInstrumentSummary('Tool', new InstrumentSummary())

        const result = await runSummaryAction({
            name: 'summary',
            summaryMdFile: 'summary/summary.md',
            summaryHtmlFile: 'summary/summary.html',
            commandsContext: [{id: 'run', command: 'node -e "process.exit(2)"'}],
        }, instrumentPath, 'Tool')

        expect(result.summaryMdFilePath).toBe(path.join(instrumentPath, 'summary', 'summary.md'))
        expect(result.summaryHtmlFilePath).toBe(path.join(instrumentPath, 'summary', 'summary.html'))
        expect(missionContext.getVariable('ToolSummaryMd')).toBe(path.join(instrumentPath, 'summary', 'summary.md'))
        expect(missionContext.getVariable('ToolSummaryHtml')).toBe(path.join(instrumentPath, 'summary', 'summary.html'))
        expect(missionContext.missionSummary.getInstrumentSummary('Tool').commandsSummary.size).toBe(0)
    })

    test('should run commands and return null for missing summary files', async () => {
        const instrumentPath = path.join(tempDir, 'tool')
        fs.mkdirSync(instrumentPath, {recursive: true})
        missionContext.missionSummary.addInstrumentSummary('Tool', new InstrumentSummary())
        const warnSpy = jest.spyOn(console, 'warn').mockImplementation()

        const result = await runSummaryAction({
            name: 'summary',
            summaryMdFile: 'summary/summary.md',
            summaryHtmlFile: 'summary/summary.html',
            commandsContext: [{id: 'run', command: 'node -e "process.exit(0)"'}],
        }, instrumentPath, 'Tool')

        expect(result.summaryMdFilePath).toBe(null)
        expect(result.summaryHtmlFilePath).toBe(null)
        expect(warnSpy).toHaveBeenCalledTimes(2)
        expect(missionContext.getVariable('ToolSummaryMd')).toBe('null')
        expect(missionContext.getVariable('ToolSummaryHtml')).toBe('null')
    })

    test('should use command dir over instrument path when provided', async () => {
        const instrumentPath = path.join(tempDir, 'tool')
        const commandDir = path.join(tempDir, 'custom-dir')
        fs.mkdirSync(instrumentPath, {recursive: true})
        fs.mkdirSync(commandDir, {recursive: true})
        missionContext.missionSummary.addInstrumentSummary('Tool', new InstrumentSummary())

        await runSummaryAction({
            name: 'summary',
            commandsContext: [
                {
                    id: 'run',
                    dir: commandDir,
                    command: 'node -e "require(\'fs\').writeFileSync(\'generated.txt\',\'ok\')"',
                },
            ],
        }, instrumentPath, 'Tool')

        expect(fs.existsSync(path.join(commandDir, 'generated.txt'))).toBe(true)
        expect(fs.existsSync(path.join(instrumentPath, 'generated.txt'))).toBe(false)
    })
})
