import fs from 'fs'
import path from 'node:path'
import yaml from 'js-yaml'

import AdmZip from 'adm-zip'
import {runMission} from '../../src/runner/mission-runner'
import {cleanupTempDir, makeTempDir, writeYaml} from '../utils/fs-test.utils'
import {resetMissionContext} from '../utils/mission-context.utils'

async function waitForFile(filePath: string, timeoutMs = 6000): Promise<void> {
    const start = Date.now()
    while (!fs.existsSync(filePath)) {
        if (Date.now() - start > timeoutMs)
            throw new Error(`Timed out waiting for file ${filePath}`)
        await new Promise(resolve => setTimeout(resolve, 100))
    }
}

async function waitForValidZip(zipPath: string, timeoutMs = 8000): Promise<AdmZip> {
    const start = Date.now()
    while (true) {
        try {
            const zip = new AdmZip(zipPath)
            if (zip.getEntries().length > 0)
                return zip
        } catch {
        }
        if (Date.now() - start > timeoutMs)
            throw new Error(`Timed out waiting for valid zip ${zipPath}`)
        await new Promise(resolve => setTimeout(resolve, 100))
    }
}

function buildBasicMission(tempDir: string, missionName: string): string {
    const instrumentsDir = path.join(tempDir, 'instruments')
    const toolDir = path.join(instrumentsDir, 'tool')
    fs.mkdirSync(toolDir, {recursive: true})
    fs.mkdirSync(path.join(instrumentsDir, 'output'), {recursive: true})
    fs.writeFileSync(path.join(instrumentsDir, 'output', 'artifact.txt'), 'artifact')

    writeYaml(path.join(tempDir, 'mission.yml'), {
        mission: missionName,
        instrumentsDir: './instruments',
    })

    writeYaml(path.join(toolDir, 'instrument.v2.yml'), {
        id: 'tool-id',
        name: 'Tool',
        version: '1.0.0',
        actions: {
            start: {
                commands: {
                    run: {
                        id: 'run',
                        command: 'node -e "console.log(\'start-run\')"',
                    },
                },
            },
            pack: {
                with: {
                    locations: [{source: 'output', destination: 'out'}],
                },
            },
            verify: {
                with: {
                    requirements: [
                        {
                            name: 'node',
                            min: '0.0.1',
                            match: ['(?<version>.+)'],
                            command: 'node -e "console.log(\'1.0.0\')"',
                        },
                    ],
                },
            },
        },
    })

    return path.join(tempDir, 'mission.yml')
}

describe('mission runner integration default flow', () => {
    let tempDir = ''
    let initialCwd = ''
    let originalLog: (...args: any[]) => void
    let originalError: (...args: any[]) => void

    beforeEach(() => {
        resetMissionContext()
        tempDir = makeTempDir('voyager-mission-integration')
        initialCwd = process.cwd()
        originalLog = console.log
        originalError = console.error
        process.chdir(tempDir)
    })

    afterEach(() => {
        console.log = originalLog
        console.error = originalError
        process.chdir(initialCwd)
        cleanupTempDir(tempDir)
        resetMissionContext()
    })

    test('runMission default flow should produce summary and zipped report artifacts', async () => {
        const missionFilePath = buildBasicMission(tempDir, 'default-flow')
        const zipPath = path.join(tempDir, 'default-flow-voyager-results.zip')

        await runMission(missionFilePath, undefined)
        await waitForFile(zipPath)
        const zip = await waitForValidZip(zipPath)
        const entryNames = zip.getEntries().map(entry => entry.entryName)

        expect(entryNames).toContain('mission.yml')
        expect(entryNames).toContain('MissionReport.html')
        expect(entryNames).toContain('voyager.lock.yml')
        expect(entryNames.some(name => name.endsWith('Tool.log'))).toBe(true)
        expect(entryNames.some(name => name.endsWith('default-flow.log'))).toBe(true)

        const lockFileEntry = zip.getEntry('voyager.lock.yml')
        expect(lockFileEntry).toBeDefined()
        const lockFileContent = yaml.load(zip.readAsText(lockFileEntry!)) as {
            mission: string
            runningTime: string
            tools: Array<{id: string, name: string, version: string, runningTime: string, finishedAt: string}>
        }
        expect(lockFileContent.mission).toBe('default-flow')
        expect(lockFileContent.runningTime.endsWith('s')).toBe(true)
        expect(lockFileContent.tools).toEqual(expect.arrayContaining([
            expect.objectContaining({
                id: 'tool-id',
                name: 'Tool',
                version: '1.0.0',
            }),
        ]))
        expect(lockFileContent.tools[0].runningTime.endsWith('s')).toBe(true)
        expect(lockFileContent.tools[0].finishedAt).toMatch(/^\d{2}\.\d{2}\.\d{4} \d{2}:\d{2}$/)

        const missionLogPath = path.join(tempDir, 'default-flow.log')
        expect(fs.existsSync(missionLogPath)).toBe(true)
    })
})
