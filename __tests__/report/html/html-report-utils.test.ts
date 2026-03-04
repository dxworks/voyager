import path from 'node:path'

import {missionContext} from '../../../src/context/MissionContext'
import {VOYAGER_WORKING_DIR} from '../../../src/context/context-variable-provider'
import {
    getHtmlFilePath,
    getHtmlLogContent,
    getInstrumentSummaryHtml,
    normalizeInstrumentName,
} from '../../../src/report/html/html-report-utils'
import {resetMissionContext} from '../../utils/mission-context.utils'

describe('html report utils', () => {
    beforeEach(() => {
        resetMissionContext()
        missionContext.addVariable(VOYAGER_WORKING_DIR, '/tmp/work')
    })

    afterEach(() => {
        resetMissionContext()
    })

    test('normalizeInstrumentName should remove special characters', () => {
        const normalized = normalizeInstrumentName('Tool-1.2!')

        expect(normalized).toBe('Tool12')
    })

    test('getHtmlFilePath should use voyager working dir', () => {
        const htmlPath = getHtmlFilePath('Tool')

        expect(htmlPath).toBe(path.join('/tmp/work', 'Tool.html'))
    })

    test('getInstrumentSummaryHtml should include clickable link and command row', () => {
        const html = getInstrumentSummaryHtml('Tool-One', 2, 'lint', 'SUCCESS', '0.4s')

        expect(html).toContain('Tool-One')
        expect(html).toContain('rowspan="2"')
        expect(html).toContain('<td>lint</td>')
        expect(html).toContain('<td class="success">SUCCESS</td>')
        expect(html).toContain('ToolOneOpenNewTab')
    })

    test('getHtmlLogContent should include title and logs in html body', () => {
        const html = getHtmlLogContent('Demo', 'line1\nline2')

        expect(html).toContain('<title>Demo</title>')
        expect(html).toContain('line1')
        expect(html).toContain('line2')
    })
})
