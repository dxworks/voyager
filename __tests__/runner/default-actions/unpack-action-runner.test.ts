import fs from 'fs'
import path from 'path'

import {missionContext} from '../../../src/context/MissionContext'
import {DefaultAction} from '../../../src/model/Action'
import {runUnpackAction} from '../../../src/runner/default-actions/unpack-action-runner'
import {cleanupTempDir, makeTempDir} from '../../utils/fs-test.utils'
import {resetMissionContext} from '../../utils/mission-context.utils'

describe('unpack action runner', () => {
    let tempDir = ''

    beforeEach(() => {
        resetMissionContext()
        tempDir = makeTempDir('voyager-unpack-action')
    })

    afterEach(() => {
        cleanupTempDir(tempDir)
        resetMissionContext()
        jest.restoreAllMocks()
    })

    test('should copy produced file based on mapping and create destination directory', () => {
        const unpackedDir = path.resolve(tempDir, 'unpacked')
        fs.mkdirSync(path.resolve(unpackedDir, 'reports'), {recursive: true})
        fs.writeFileSync(path.resolve(unpackedDir, 'reports/summary.json'), '{}', {flag: 'w'})

        const destination = path.resolve(tempDir, 'out/nested')
        missionContext.unpackMapping.addMappingElement('Tool', 'summary', destination, '${initialMissionName}')

        runUnpackAction(<DefaultAction>{
            name: 'unpack',
            produces: new Map([['summary', 'reports/summary.json']]),
        }, 'Tool', unpackedDir, 'mission-x')

        const outputPath = path.resolve(destination, 'mission-x-summary.json')
        expect(fs.existsSync(outputPath)).toBe(true)
    })

    test('should warn and skip copy when produced file is missing', () => {
        const warnSpy = jest.spyOn(console, 'warn').mockImplementation()
        const unpackedDir = path.resolve(tempDir, 'unpacked')
        fs.mkdirSync(unpackedDir)
        const destination = path.resolve(tempDir, 'out')

        missionContext.unpackMapping.addMappingElement('Tool', 'summary', destination, 'prefix')

        runUnpackAction(<DefaultAction>{
            name: 'unpack',
            produces: new Map([['summary', 'reports/missing.json']]),
        }, 'Tool', unpackedDir, 'mission-x')

        expect(warnSpy).toHaveBeenCalledWith('The file summary is absent from the results archive.')
        expect(fs.existsSync(path.resolve(destination, 'prefix-missing.json'))).toBe(false)
    })
})
