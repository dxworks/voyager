import fs from 'fs'
import path from 'node:path'

import {missionContext} from '../../../src/context/MissionContext'
import {INSTRUMENTS_DIR, VOYAGER_WORKING_DIR} from '../../../src/context/context-variable-provider'
import {DefaultAction} from '../../../src/model/Action'
import {runPackageAction} from '../../../src/runner/default-actions/package-action-runner'
import {FakeArchive} from '../../utils/archive-fake.utils'
import {cleanupTempDir, makeTempDir} from '../../utils/fs-test.utils'
import {resetMissionContext} from '../../utils/mission-context.utils'

describe('package action runner', () => {
    let tempDir = ''

    beforeEach(() => {
        resetMissionContext()
        tempDir = makeTempDir('voyager-package-action')
        missionContext.addVariable(INSTRUMENTS_DIR, tempDir)
        missionContext.addVariable(VOYAGER_WORKING_DIR, tempDir)
    })

    afterEach(() => {
        cleanupTempDir(tempDir)
        resetMissionContext()
    })

    test('should add log file when present', () => {
        const archive = new FakeArchive()
        fs.writeFileSync(path.join(tempDir, 'Tool.log'), 'logs')

        runPackageAction('Tool', <any>archive, <DefaultAction>{
            name: 'pack',
            with: {
                locations: [],
            },
        })

        expect(archive.files.find(file => file.name === 'Tool.log')).toBeDefined()
    })

    test('should package only matching files when patterns are provided', () => {
        const sourceDir = path.join(tempDir, 'results')
        fs.mkdirSync(sourceDir)
        fs.writeFileSync(path.join(sourceDir, 'a.json'), '{}')
        fs.writeFileSync(path.join(sourceDir, 'b.txt'), 'x')
        const archive = new FakeArchive()

        runPackageAction('Tool', <any>archive, <DefaultAction>{
            name: 'pack',
            with: {
                locations: [{source: 'results', destination: 'out', files: ['*.json']}],
            },
        })

        const packagedFiles = archive.files.map(file => file.name)
        expect(packagedFiles).toContain(path.join('Tool', 'out', 'a.json'))
        expect(packagedFiles).not.toContain(path.join('Tool', 'out', 'b.txt'))
    })

    test('should package whole directory when files list is missing', () => {
        const sourceDir = path.join(tempDir, 'all-results')
        fs.mkdirSync(sourceDir)
        const archive = new FakeArchive()

        runPackageAction('Tool', <any>archive, <DefaultAction>{
            name: 'pack',
            with: {
                locations: [<any>{source: 'all-results', destination: 'bundle'}],
            },
        })

        expect(archive.directories.length).toBe(1)
        expect(archive.directories[0].destination).toBe(path.join('Tool', 'bundle'))
    })
})
