import fs from 'fs'
import path from 'node:path'

import {missionContext} from '../../../src/context/MissionContext'
import {INSTRUMENTS_DIR} from '../../../src/context/context-variable-provider'
import {DefaultAction} from '../../../src/model/Action'
import {runCleanAction} from '../../../src/runner/default-actions/clean-action-runner'
import {cleanupTempDir, makeTempDir} from '../../utils/fs-test.utils'
import {resetMissionContext} from '../../utils/mission-context.utils'

describe('clean action runner', () => {
    let tempDir = ''

    beforeEach(() => {
        resetMissionContext()
        tempDir = makeTempDir('voyager-clean-action')
        missionContext.addVariable(INSTRUMENTS_DIR, tempDir)
    })

    afterEach(() => {
        cleanupTempDir(tempDir)
        resetMissionContext()
    })

    test('should delete only files matching glob patterns', async () => {
        const sourceDir = path.join(tempDir, 'reports')
        fs.mkdirSync(sourceDir)
        fs.writeFileSync(path.join(sourceDir, 'a.tmp'), 'a')
        fs.writeFileSync(path.join(sourceDir, 'b.log'), 'b')

        await runCleanAction(<DefaultAction>{
            name: 'clean',
            with: {
                locations: [{source: 'reports', destination: '', files: ['*.tmp']}],
            },
        })

        expect(fs.existsSync(path.join(sourceDir, 'a.tmp'))).toBe(false)
        expect(fs.existsSync(path.join(sourceDir, 'b.log'))).toBe(true)
    })

    test('should remove whole directory when rmDir is true', async () => {
        const sourceDir = path.join(tempDir, 'cache')
        fs.mkdirSync(path.join(sourceDir, 'nested'), {recursive: true})
        fs.writeFileSync(path.join(sourceDir, 'nested', 'x.txt'), 'x')

        await runCleanAction(<DefaultAction>{
            name: 'clean',
            with: {
                locations: [<any>{source: 'cache', rmDir: true}],
            },
        })

        expect(fs.existsSync(sourceDir)).toBe(false)
    })

    test('should keep root directory and delete only its content when rmDir is false', async () => {
        const sourceDir = path.join(tempDir, 'workspace')
        fs.mkdirSync(path.join(sourceDir, 'nested'), {recursive: true})
        fs.writeFileSync(path.join(sourceDir, 'nested', 'x.txt'), 'x')

        await runCleanAction(<DefaultAction>{
            name: 'clean',
            with: {
                locations: [<any>{source: 'workspace', rmDir: false}],
            },
        })

        expect(fs.existsSync(sourceDir)).toBe(true)
        expect(fs.readdirSync(sourceDir).length).toBe(0)
    })
})
