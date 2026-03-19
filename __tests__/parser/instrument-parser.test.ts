import path from 'node:path'

import {missionContext} from '../../src/context/MissionContext'
import {RESULTS_UNPACK_DIR} from '../../src/context/context-variable-provider'
import {missionActionVarProvider} from '../../src/context/mission-variable-providers'
import {summaryActionKey} from '../../src/runner/action-utils'
import {parseInstrument} from '../../src/parser/instrument-parser'
import {resetMissionContext} from '../utils/mission-context.utils'

describe('instrument parser', () => {
    const instrumentsDirPath = path.resolve('./instruments')
    const instrumentDir = 'tool-dir'

    beforeEach(() => {
        resetMissionContext()
        missionContext.addVariable(RESULTS_UNPACK_DIR, path.resolve('./results'))
        missionContext.addVariable('workspace', '/tmp/workspace')
    })

    afterEach(() => {
        resetMissionContext()
    })

    test('should parse instrument metadata and default run order', () => {
        const instrument = parseInstrument(instrumentsDirPath, instrumentDir, {
            id: 'tool',
            name: 'Tool',
            version: '1.0.0',
            actions: {
                start: {
                    commands: {
                        first: {id: 'first', command: 'node -e ""'},
                    },
                },
            },
        })

        expect(instrument.id).toBe('tool')
        expect(instrument.name).toBe('Tool')
        expect(instrument.runOrder).toBe(0)
        expect(instrument.actions.has('start')).toBe(true)
    })

    test('should parse command object and interpolate mission/action variables', () => {
        missionActionVarProvider.addVariables({
            instrumentKey: 'tool',
            actionKey: 'start',
            variableKey: 'actionParam',
            value: 'mission-action-value',
        })

        const instrument = parseInstrument(instrumentsDirPath, instrumentDir, {
            id: 'tool',
            name: 'Tool',
            version: '1.0.0',
            actions: {
                start: {
                    parameters: {localParam: 'local-value'},
                    commands: {
                        first: {
                            id: 'first',
                            command: {
                                windows: 'cmd /c ${workspace}-${actionParam}',
                                unix: 'echo ${workspace}-${actionParam}',
                                mac: 'echo ${workspace}-${actionParam}',
                                linux: 'echo ${workspace}-${actionParam}',
                            },
                            dir: '${workspace}/repo',
                            environment: {
                                MY_ENV: '${workspace}',
                            },
                        },
                    },
                },
            },
        })

        const command = instrument.actions.get('start')!.commandsContext![0]
        expect((<any>command.command).unix).toBe('echo /tmp/workspace-mission-action-value')
        expect(command.dir).toBe('/tmp/workspace/repo')
        expect(command.environment!.get('MY_ENV')).toBe('/tmp/workspace')
    })

    test('should throw when deprecated summaryFile field is present', () => {
        expect(() => parseInstrument(instrumentsDirPath, instrumentDir, {
            id: 'tool',
            name: 'Tool',
            version: '1.0.0',
            actions: {
                summary: {
                    summaryFile: 'summary.md',
                    commands: {},
                },
            },
        })).toThrow('Invalid field \'summaryFile\'')
    })

    test('should update summary variables for summary action', () => {
        parseInstrument(instrumentsDirPath, instrumentDir, {
            id: 'tool',
            name: 'Tool',
            version: '1.0.0',
            actions: {
                [summaryActionKey]: {
                    summaryMdFile: 'summary/tool.md',
                    summaryHtmlFile: 'summary/tool.html',
                    summaryCategory: 'Architecture',
                    commands: {},
                },
            },
        })

        const instrumentPath = path.resolve(instrumentsDirPath, instrumentDir)
        expect(missionContext.getVariable('ToolSummaryMd')).toBe(path.resolve(instrumentPath, 'summary/tool.md'))
        expect(missionContext.getVariable('ToolSummaryHtml')).toBe(path.resolve(instrumentPath, 'summary/tool.html'))
        expect(missionContext.getVariable('ToolSummaryCategory')).toBe('Architecture')
    })

    test('should keep summary category variable null when summaryCategory is missing', () => {
        parseInstrument(instrumentsDirPath, instrumentDir, {
            id: 'tool',
            name: 'Tool',
            version: '1.0.0',
            actions: {
                [summaryActionKey]: {
                    summaryMdFile: 'summary/tool.md',
                    summaryHtmlFile: 'summary/tool.html',
                    commands: {},
                },
            },
        })

        expect(missionContext.getVariable('ToolSummaryCategory')).toBe('null')
    })
})
