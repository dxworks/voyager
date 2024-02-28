import {Instrument} from '../model/Instrument'
import {missionContext} from '../context/MissionContext'
import {loadAndParseData} from '../parser/data-parser'
import {cleanActionKey, packageActionKey, unpackActionKey, verifyActionKey} from './action-utils'
import {DefaultAction} from '../model/Action'
import {runCleanAction} from './default-actions/clean-action-runner'
import archiver, {Archiver} from 'archiver'
import fs from 'fs-extra'
import {getLogFilePath, getLogsStream, getTimeInSeconds} from '../report/logs-collector-utils'
import {generateMissionSummary} from '../report/mission-summary-generator'
import path from 'node:path'
import {generateHtmlReport} from '../report/html/html-report-generator'
import {getHtmlFilePath, getHtmlLogContent} from '../report/html/html-report-utils'
import {runInstrument} from './instrument-runner'
import {runVerifyActionsAndGetReport} from './default-actions/verify-action-runner'
import {generateDoctorReportLogs} from '../report/doctor-summary-generator'
import {RESULTS_ZIP_DIR, TARGET} from '../context/context-variable-provider'
import AdmZip from 'adm-zip'
import {runUnpackAction} from './default-actions/unpack-action-runner'
import {runPackageAction} from './default-actions/package-action-runner'
import {buildAndOpenLegacySummary, openMissionSummary} from './mission-summary-runner'
import yaml from 'js-yaml'

export async function cleanMission(missionFilePath?: string): Promise<void> {
    const missionPath = findMissionFile(missionFilePath)
    if (missionPath) {
        loadAndParseData(missionPath)
        console.log(`Start cleaning the mission ${missionContext.name}...`)
        const cleanActions = missionContext.instruments.map(instrument => (<DefaultAction>instrument.actions.get(cleanActionKey)))
            .filter(cleanAction => cleanAction != null)
        cleanActions.forEach(cleanAction => runCleanAction(cleanAction))
        console.log(`Mission ${missionContext.name} was cleaned successfully.`)
    }
}

export async function verifyMission(missionFilePath?: string): Promise<void> {
    const missionPath = findMissionFile(missionFilePath)
    if (missionPath) {
        loadAndParseData(missionPath)
        console.log(`Start verifying the mission ${missionContext.name}...`)
        await runVerifyActionsAndGetReport()
        generateDoctorReportLogs()
    }
}

export function packMission(missionFilePath?: string): void {
    const missionPath = findMissionFile(missionFilePath)
    if (missionPath) {
        loadAndParseData(missionPath)
        console.log(`Start packing the mission ${missionContext.name}...`)
        const archive = archiver('zip', {zlib: {level: 9}})
        missionContext.instruments.forEach(instrument => {
            const packAction = (<DefaultAction>instrument.actions.get(packageActionKey))
            runPackageAction(instrument.name, archive, packAction)
        })
        archive.finalize().then()
        archive.pipe(fs.createWriteStream(missionContext.getVariable(RESULTS_ZIP_DIR)!))
        console.log(`Mission ${missionContext.name} was packed successfully.`)
    }
}

export function unpackMission(missionFilePath?: string): void {
    const missionPath = findMissionFile(missionFilePath)
    if (missionPath) {
        loadAndParseData(missionPath)
        console.log(`Start the unpack mission ${missionContext.name}...`)
        if (missionContext.unpackMapping.isEmpty()) {
            console.warn(`The mission ${missionContext.name} does not contain mapping.`)
            return
        }
        getUnpackTargets().forEach(targetPath => {
            console.log(`Target path: ${targetPath}`)
            const zip = new AdmZip(targetPath)
            const unpackedDirPath = path.resolve(`./${path.basename(targetPath)}-results`)
            zip.extractAllTo(unpackedDirPath, true)
            const initialMissionName = extractInitialMissionName(unpackedDirPath)
            console.log(`Initial mission name: ${initialMissionName}`)
            missionContext.instruments.filter(instrument => instrument.actions.has(unpackActionKey))
                .forEach(instrument => runUnpackAction(<DefaultAction>instrument.actions.get(unpackActionKey), instrument.name, unpackedDirPath, initialMissionName))
            fs.remove(unpackedDirPath).then().catch((error) => console.error(`Error deleting folder ${unpackedDirPath}:`, error))
        })
        console.log(`Mission ${missionContext.name} was unpacked successfully.`)
    }
}

function getUnpackTargets(): string[] {
    if (missionContext.targets.length == 0)
        return [<string>missionContext.getVariable(TARGET)]
    else
        return missionContext.targets

}

function extractInitialMissionName(unpackedResultsPath: string): string {
    const files = fs.readdirSync(unpackedResultsPath)
    const missionFilePath = files.find((file) => file === 'mission.yml')
    if (missionFilePath) {
        const missionFile: any = yaml.load(fs.readFileSync(path.resolve(unpackedResultsPath, missionFilePath)).toString())
        return missionFile.mission
    }
    return ''
}

export function openSummary(zipPath: string, legacySummary: boolean): void {
    if (legacySummary) {
        buildAndOpenLegacySummary(zipPath)
        return
    }
    openMissionSummary(zipPath)
}

export function findMissionFile(missionFilePath?: string): string | null {
    if (missionFilePath)
        return missionFilePath
    const files = fs.readdirSync(process.cwd())
    const missionFile = files.find((file) => file === 'mission.yml')
    if (missionFile)
        return path.join(process.cwd(), missionFile)
    return null
}

export async function findAndRunMission(actions: string[] | undefined): Promise<void> {
    const missionFilePath = findMissionFile()
    if (missionFilePath == null)
        console.error('Mission YAML file could not be found in the current directory. Please specify the path of the file or make sure the name of the mission is \'mission.yml\'.')
    else
        await runMission(missionFilePath, actions)
}

export async function runMission(missionFilePath: string, actions: string[] | undefined): Promise<void> {
    const startTime = performance.now()

    loadAndParseData(missionFilePath)

    function getRunnableInstruments() {
        return <Instrument[]>missionContext.runnableInstruments.map(runnableInstrument => missionContext.instruments.find((instrument) => instrument.id == runnableInstrument))
            .filter(instrument => !!instrument)

    }

    const instruments = missionContext.runAll ? missionContext.instruments : getRunnableInstruments()
    missionContext.logsStream = getLogsStream()
    let archive: Archiver | null = null
    const customRun = actions != undefined
    const requireVerifyActionReport = customRun ? !!actions.includes(verifyActionKey) : false
    const requirePackaging = customRun ? !!actions.includes(packageActionKey) : true

    if (requirePackaging)
        archive = archiver('zip', {zlib: {level: 9}})

    await runInstruments(instruments, actions, archive, customRun)
    const endTime = performance.now()

    missionContext.missionSummary.runningTime = getTimeInSeconds(startTime, endTime)
    if (requireVerifyActionReport)
        generateDoctorReportLogs()
    if (requirePackaging) {
        addLogsAndHtmlReportToArchive(instruments, archive!)
        addMissionYmlToArchive(missionFilePath, archive!)
        archive!.finalize().then(() => cleanLogsAndHtmlFileFromDisk(instruments))
        archive!.pipe(fs.createWriteStream(missionContext.getVariable(RESULTS_ZIP_DIR)!))
    }
    generateMissionSummary()
    missionContext.logsStream.close()
}

async function runInstruments(instruments: Instrument[], actions: string[] | undefined, archive: Archiver | null, customRun: boolean) {
    for (const instrument of instruments) {
        await runInstrument(instrument, archive, customRun, actions)
    }
}

function cleanLogsAndHtmlFileFromDisk(instruments: Instrument[]): void {
    instruments.map(instrument => instrument.name).forEach(instrumentName => {
        const instrumentLogFilePath = getLogFilePath(instrumentName)
        if (fs.existsSync(instrumentLogFilePath))
            fs.unlinkSync(instrumentLogFilePath)
        const instrumentHtmlFilePath = getHtmlFilePath(instrumentName)
        if (fs.existsSync(instrumentHtmlFilePath))
            fs.unlinkSync(instrumentHtmlFilePath)
    })
    const missionHtmlFilePath = getHtmlFilePath(missionContext.name)
    if (fs.existsSync(missionHtmlFilePath))
        fs.unlinkSync(missionHtmlFilePath)
    const missionReportHtml = getHtmlFilePath('MissionReport')
    if (fs.existsSync(missionReportHtml))
        fs.unlinkSync(missionReportHtml)
}

function
addLogsAndHtmlReportToArchive(instruments: Instrument[], archive: archiver.Archiver): void {
    const htmlReport = generateHtmlReport(missionContext.missionSummary)
    addHtmlToArchive(instruments, archive)
    if (fs.existsSync(htmlReport))
        archive.file(htmlReport, {name: path.basename(htmlReport)})
    const missionLogFilePath = getLogFilePath(missionContext.name)
    if (fs.existsSync(missionLogFilePath))
        archive.file(missionLogFilePath, {name: path.basename(missionLogFilePath)})
}

function addMissionYmlToArchive(missionFilePath: string, archive: archiver.Archiver): void {
    if (missionFilePath)
        archive.file(missionFilePath, {name: path.basename(missionFilePath)})
}

function addHtmlToArchive(instruments: Instrument[], archive: archiver.Archiver): void {
    instruments.map(instrument => instrument.name).forEach(instrumentName => {
        const instrumentLogFile = getLogFilePath(instrumentName)
        if (fs.existsSync(instrumentLogFile))
            try {
                const fileContent = fs.readFileSync(instrumentLogFile, 'utf8')
                const instrumentHtmlFile = getHtmlFilePath(instrumentName)
                fs.writeFileSync(instrumentHtmlFile, getHtmlLogContent(instrumentName, fileContent))
                archive.file(instrumentHtmlFile, {name: '/html/' + path.basename(instrumentHtmlFile)})
            } catch (err) {
                console.error('Error reading/writing file:', err)
            }
    })
    try {
        const fileContent = fs.readFileSync(getLogFilePath(missionContext.name), 'utf8')
        const missionHtmlFile = getHtmlFilePath(missionContext.name)
        fs.writeFileSync(missionHtmlFile, getHtmlLogContent(missionContext.name, fileContent))
        archive.file(missionHtmlFile, {name: '/html/' + path.basename(missionHtmlFile)})
    } catch (err) {
        console.error('Error reading/writing file:', err)
    }
}