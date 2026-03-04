import path from 'node:path'

import {missionContext} from '../../src/context/MissionContext'
import {REPO, REPO_NAME, TARGET} from '../../src/context/context-variable-provider'
import {
    missionActionEnvVarProvider,
    missionActionVarProvider,
    missionCommandEnvVarProvider,
    missionCommandVarProvider,
    missionEnvVarProvider,
} from '../../src/context/mission-variable-providers'
import {parseMission} from '../../src/parser/mission-parser'
import {resetMissionContext} from '../utils/mission-context.utils'

describe('mission parser', () => {
    beforeEach(() => {
        resetMissionContext()
    })

    afterEach(() => {
        resetMissionContext()
    })

    test('should set target related mission variables', () => {
        parseMission({target: './repo/path'})

        const targetPath = path.normalize('./repo/path')
        expect(missionContext.getVariable(TARGET)).toBe(targetPath)
        expect(missionContext.getVariable(REPO)).toBe(targetPath)
        expect(missionContext.getVariable(REPO_NAME)).toBe(path.basename(targetPath))
    })

    test('should parse environment and mission scoped parameters', () => {
        parseMission({
            environment: {JAVA_HOME: '/jdk'},
            instruments: {
                sonar: {
                    actions: {
                        start: {
                            parameters: {threads: '8'},
                            environment: {SONAR_TOKEN: 'abc'},
                            commands: {
                                scan: {
                                    parameters: {format: 'json'},
                                    environment: {DEBUG: 'true'},
                                },
                            },
                        },
                    },
                },
            },
        })

        expect(missionEnvVarProvider.getVariables()[0].variableKey).toBe('JAVA_HOME')
        expect(missionActionVarProvider.getVariables()[0].variableKey).toBe('threads')
        expect(missionActionEnvVarProvider.getVariables()[0].variableKey).toBe('SONAR_TOKEN')
        expect(missionCommandVarProvider.getVariables()[0].variableKey).toBe('format')
        expect(missionCommandEnvVarProvider.getVariables()[0].variableKey).toBe('DEBUG')
    })

    test('should set runnable instruments when runAll is false', () => {
        missionContext.runAll = false

        parseMission({
            instruments: {
                first: {actions: {}},
                second: {actions: {}},
            },
        })

        expect(missionContext.runnableInstruments).toEqual(['first', 'second'])
    })

    test('should parse targets and mapping into mission context', () => {
        parseMission({
            targets: ['./repo1', './repo2'],
            mapping: {
                sonar: {
                    item1: {source: 'quality', destination: './out', prefix: 'mission'},
                },
            },
        })

        expect(missionContext.targets).toEqual(['./repo1', './repo2'])
        const mapping = missionContext.unpackMapping.getInstrumentMapping('sonar')
        expect(mapping.length).toBe(1)
        expect(mapping[0].fileId).toBe('quality')
        expect(mapping[0].destination).toBe('./out')
        expect(mapping[0].prefix).toBe('mission')
    })
})
