import path from 'node:path'

import {missionContext} from '../../src/context/MissionContext'
import {RESULTS_UNPACK_DIR} from '../../src/context/context-variable-provider'
import {parseInstrument} from '../../src/parser/instrument-parser'
import {parseMission} from '../../src/parser/mission-parser'
import {resetMissionContext} from '../utils/mission-context.utils'

describe('instrument parser precedence', () => {
    beforeEach(() => {
        resetMissionContext()
        missionContext.addVariable(RESULTS_UNPACK_DIR, path.resolve('./results'))
    })

    afterEach(() => {
        resetMissionContext()
    })

    test('parameter and environment precedence should favor mission command values', () => {
        parseMission({
            instruments: {
                toolid: {
                    actions: {
                        start: {
                            parameters: {value: 'mission-action'},
                            environment: {ENV_X: 'mission-action-env'},
                            commands: {
                                cmd1: {
                                    parameters: {value: 'mission-command'},
                                    environment: {ENV_X: 'mission-command-env'},
                                },
                            },
                        },
                    },
                },
            },
        })

        const instrument = parseInstrument(path.resolve('./instruments'), 'tool', {
            id: 'toolid',
            name: 'Tool',
            version: '1.0.0',
            actions: {
                start: {
                    parameters: {value: 'instrument-action'},
                    environment: {ENV_X: 'instrument-action-env'},
                    commands: {
                        cmd1: {
                            id: 'cmd1',
                            command: 'echo ${value}',
                            environment: {ENV_X: 'instrument-command-env'},
                        },
                    },
                },
            },
        })

        const command = instrument.actions.get('start')!.commandsContext![0]
        expect(command.command).toBe('echo mission-command')
        expect(command.environment!.get('ENV_X')).toBe('mission-command-env')
    })

    test('instrument parser should handle missing commands object by returning empty command list', () => {
        const instrument = parseInstrument(path.resolve('./instruments'), 'tool', {
            id: 'toolid',
            name: 'Tool',
            version: '1.0.0',
            actions: {
                custom: {
                },
            },
        })

        expect(instrument.actions.get('custom')!.commandsContext).toEqual([])
    })
})
