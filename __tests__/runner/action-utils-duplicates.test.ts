import fs from 'fs'
import path from 'node:path'

import {getMatchingFilesFromDir} from '../../src/runner/action-utils'
import {cleanupTempDir, makeTempDir} from '../utils/fs-test.utils'

describe('action utils duplicate matching behavior', () => {
    let tempDir = ''

    beforeEach(() => {
        tempDir = makeTempDir('voyager-action-utils-duplicates')
    })

    afterEach(() => {
        cleanupTempDir(tempDir)
    })

    test('overlapping patterns should keep duplicates based on current implementation', () => {
        const sourcePath = path.join(tempDir, 'results')
        fs.mkdirSync(sourcePath)
        fs.writeFileSync(path.join(sourcePath, 'a.log'), 'a')

        const matching = getMatchingFilesFromDir(sourcePath, ['*.log', 'a.*'])

        expect(matching).toEqual(['a.log', 'a.log'])
    })
})
