import fs from 'fs'
import path from 'node:path'

import {missionContext} from '../../../src/context/MissionContext'
import {VOYAGER_WORKING_DIR} from '../../../src/context/context-variable-provider'
import {CommandSummary} from '../../../src/model/summary/CommandSummary'
import {InstrumentSummary} from '../../../src/model/summary/InstrumentSummary'
import {MissionSummary} from '../../../src/model/summary/MissionSummary'
import {generateHtmlReport, generateHtmlReportContent} from '../../../src/report/html/html-report-generator'
import {cleanupTempDir, makeTempDir} from '../../utils/fs-test.utils'
import {resetMissionContext} from '../../utils/mission-context.utils'

function makeMissionSummary(): MissionSummary {
    const missionSummary = new MissionSummary()
    missionSummary.missionName = 'DemoMission'
    missionSummary.runningTime = '1.2s'

    const instrumentSummary = new InstrumentSummary()
    const success = new CommandSummary()
    success.success = true
    success.runningTime = '0.4s'
    const fail = new CommandSummary()
    fail.success = false
    fail.runningTime = '0.8s'
    instrumentSummary.addCommandSummary('lint', success)
    instrumentSummary.addCommandSummary('test', fail)
    missionSummary.addInstrumentSummary('Tool-One', instrumentSummary)

    return missionSummary
}

describe('html report generator', () => {
    let tempDir = ''

    beforeEach(() => {
        resetMissionContext()
        tempDir = makeTempDir('voyager-html-report')
        missionContext.addVariable(VOYAGER_WORKING_DIR, tempDir)
    })

    afterEach(() => {
        cleanupTempDir(tempDir)
        resetMissionContext()
    })

    test('generateHtmlReport should write mission report in voyager working dir', () => {
        const summary = makeMissionSummary()

        const reportPath = generateHtmlReport(summary)

        expect(reportPath).toBe(path.join(tempDir, 'MissionReport.html'))
        expect(fs.existsSync(reportPath)).toBe(true)
    })

    test('generateHtmlReportContent should include instrument and command status rows', () => {
        const summary = makeMissionSummary()

        const content = generateHtmlReportContent(summary)

        expect(content).toContain('Tool-One')
        expect(content).toContain('<td>lint</td>')
        expect(content).toContain('<td class="success">SUCCESS</td>')
        expect(content).toContain('<td>test</td>')
        expect(content).toContain('<td class="fail">FAIL</td>')
    })
})
