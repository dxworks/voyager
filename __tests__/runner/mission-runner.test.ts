import fs from 'fs'
import path from 'node:path'

import {findMissionFile} from '../../src/runner/mission-runner'
import {cleanupTempDir, makeTempDir} from '../utils/fs-test.utils'

describe('mission runner', () => {
    let tempDir = ''
    let initialCwd = ''

    beforeEach(() => {
        tempDir = makeTempDir('voyager-mission-runner')
        initialCwd = process.cwd()
    })

    afterEach(() => {
        process.chdir(initialCwd)
        cleanupTempDir(tempDir)
    })

    test('findMissionFile should return explicit path when provided', () => {
        const explicitPath = path.join(tempDir, 'another-mission.yml')

        expect(findMissionFile(explicitPath)).toBe(explicitPath)
    })

    test('findMissionFile should discover mission.yml from current directory', () => {
        const missionPath = path.join(tempDir, 'mission.yml')
        fs.writeFileSync(missionPath, 'mission: test')
        process.chdir(tempDir)

        expect(findMissionFile()).toBe(missionPath)
    })

    test('findMissionFile should return null when mission.yml is missing', () => {
        process.chdir(tempDir)

        expect(findMissionFile()).toBe(null)
    })
})
