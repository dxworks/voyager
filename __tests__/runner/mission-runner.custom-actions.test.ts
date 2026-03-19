import fs from 'fs'
import path from 'node:path'

import AdmZip from 'adm-zip'
import {missionContext} from '../../src/context/MissionContext'
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

async function waitForValidZip(zipPath: string, timeoutMs = 8000): Promise<void> {
    const start = Date.now()
    while (true) {
        try {
            const zip = new AdmZip(zipPath)
            if (zip.getEntries().length > 0)
                return
        } catch {
        }
        if (Date.now() - start > timeoutMs)
            throw new Error(`Timed out waiting for valid zip ${zipPath}`)
        await new Promise(resolve => setTimeout(resolve, 100))
    }
}

function buildMissionWithStartAndVerify(tempDir: string, missionName: string): string {
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
                        command: 'node -e "console.log(\'start\')"',
                    },
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
            pack: {
                with: {
                    locations: [{source: 'output', destination: 'out'}],
                },
            },
        },
    })

    return path.join(tempDir, 'mission.yml')
}

describe('mission runner custom actions', () => {
    let tempDir = ''
    let initialCwd = ''
    let originalLog: (...args: any[]) => void
    let originalError: (...args: any[]) => void

    beforeEach(() => {
        resetMissionContext()
        tempDir = makeTempDir('voyager-mission-custom')
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

    test('verify-only custom actions should skip packaging and still collect verify report', async () => {
        const missionFilePath = buildMissionWithStartAndVerify(tempDir, 'verify-only')

        await runMission(missionFilePath, ['verify'])

        expect(fs.existsSync(path.join(tempDir, 'verify-only-voyager-results.zip'))).toBe(false)
        expect(missionContext.doctorReport.instrumentsDoctorReport.length).toBe(1)
        expect(missionContext.doctorReport.instrumentsDoctorReport[0].requirementsByName.get('node')).toBe(true)
    })

    test('start-only custom actions should skip verify and packaging side effects', async () => {
        const missionFilePath = buildMissionWithStartAndVerify(tempDir, 'start-only')

        await runMission(missionFilePath, ['start'])

        expect(fs.existsSync(path.join(tempDir, 'start-only-voyager-results.zip'))).toBe(false)
        expect(missionContext.doctorReport.instrumentsDoctorReport.length).toBe(0)
    })

    test('default run should package artifacts', async () => {
        const missionFilePath = buildMissionWithStartAndVerify(tempDir, 'default-run')
        const zipPath = path.join(tempDir, 'default-run-voyager-results.zip')

        await runMission(missionFilePath, undefined)
        await waitForFile(zipPath)
        await waitForValidZip(zipPath)

        expect(fs.existsSync(zipPath)).toBe(true)
    })

    test('runAll false should log and execute only runnable instruments', async () => {
        const instrumentsDir = path.join(tempDir, 'instruments')
        const alphaDir = path.join(instrumentsDir, 'alpha')
        const betaDir = path.join(instrumentsDir, 'beta')
        fs.mkdirSync(alphaDir, {recursive: true})
        fs.mkdirSync(betaDir, {recursive: true})

        writeYaml(path.join(tempDir, 'mission.yml'), {
            mission: 'filtered-run',
            runAll: false,
            instrumentsDir: './instruments',
            instruments: {
                alpha: {actions: {}},
            },
        })

        writeYaml(path.join(alphaDir, 'instrument.v2.yml'), {
            id: 'alpha',
            name: 'Alpha',
            version: '1.0.0',
            runOrder: 0,
            actions: {
                start: {
                    commands: {
                        run: {
                            id: 'run',
                            command: 'node -e "require(\'fs\').writeFileSync(\'alpha.txt\',\'1\')"',
                        },
                    },
                },
            },
        })

        writeYaml(path.join(betaDir, 'instrument.v2.yml'), {
            id: 'beta',
            name: 'Beta',
            version: '1.0.0',
            runOrder: 1,
            actions: {
                start: {
                    commands: {
                        run: {
                            id: 'run',
                            command: 'node -e "require(\'fs\').writeFileSync(\'beta.txt\',\'1\')"',
                        },
                    },
                },
            },
        })

        const missionFilePath = path.join(tempDir, 'mission.yml')
        const logSpy = jest.spyOn(console, 'log').mockImplementation()

        await runMission(missionFilePath, ['start'])

        expect(fs.existsSync(path.join(alphaDir, 'alpha.txt'))).toBe(true)
        expect(fs.existsSync(path.join(betaDir, 'beta.txt'))).toBe(false)
        expect(logSpy).toHaveBeenCalledWith('Instrument execution order:')
        expect(logSpy).toHaveBeenCalledWith('  1. Alpha (runOrder: 0)')
        expect(logSpy).not.toHaveBeenCalledWith('  2. Beta (runOrder: 1)')

        logSpy.mockRestore()
    })
})
