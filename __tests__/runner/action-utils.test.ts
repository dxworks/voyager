import fs from 'fs'
import path from 'node:path'

import {getMatchingFilesFromDir, isDefaultAction} from '../../src/runner/action-utils'
import {cleanupTempDir, makeTempDir} from '../utils/fs-test.utils'

describe('action utils', () => {
    let tempDir = ''

    beforeEach(() => {
        tempDir = makeTempDir('voyager-action-utils')
    })

    afterEach(() => {
        cleanupTempDir(tempDir)
    })

    test('isDefaultAction should return true for default actions and false otherwise', () => {
        expect(isDefaultAction('clean')).toBe(true)
        expect(isDefaultAction('pack')).toBe(true)
        expect(isDefaultAction('verify')).toBe(true)
        expect(isDefaultAction('unpack')).toBe(true)
        expect(isDefaultAction('summary')).toBe(true)
        expect(isDefaultAction('start')).toBe(false)
        expect(isDefaultAction('custom')).toBe(false)
    })

    test('getMatchingFilesFromDir should return empty list when source is missing', () => {
        const matching = getMatchingFilesFromDir(path.join(tempDir, 'missing'), ['*.log'])

        expect(matching).toEqual([])
    })

    test('getMatchingFilesFromDir should return files matching provided patterns', () => {
        fs.mkdirSync(path.join(tempDir, 'results'))
        fs.writeFileSync(path.join(tempDir, 'results', 'a.log'), 'a')
        fs.writeFileSync(path.join(tempDir, 'results', 'b.txt'), 'b')
        fs.writeFileSync(path.join(tempDir, 'results', 'c.log'), 'c')

        const matching = getMatchingFilesFromDir(path.join(tempDir, 'results'), ['*.log'])

        expect(matching.sort()).toEqual(['a.log', 'c.log'])
    })
})
