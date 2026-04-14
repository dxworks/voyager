import {Instrument} from '../model/Instrument'
import {missionContext} from '../context/MissionContext'
import {loadAndParseData} from '../parser/data-parser'
import {cleanActionKey, packageActionKey, summaryActionKey, unpackActionKey, verifyActionKey} from './action-utils'
import {DefaultAction} from '../model/Action'
import {runCleanAction} from './default-actions/clean-action-runner'
import {runSummaryAction} from './default-actions/summary-action-runner'
import archiver, {Archiver} from 'archiver'
import fs from 'fs-extra'
import {getCurrentDateTime, getLogFilePath, getLogsStream, getTimeInSeconds} from '../report/logs-collector-utils'
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
import yaml from 'js-yaml'
import {InstrumentSummary} from '../model/summary/InstrumentSummary'
import {generateMissionLockFile, getMissionLockFilePath} from '../report/mission-lockfile-generator'

export async function cleanMission(missionFilePath?: string, verbose = false): Promise<void> {
    const missionPath = findMissionFile(missionFilePath)
    if (missionPath) {
        loadAndParseData(missionPath)
        const cleanInstruments = getMissionScopedInstrumentsWithAction(cleanActionKey)
        logExecutionOrder(cleanInstruments)
        if (verbose)
            console.log(`[verbose] Running '${cleanActionKey}' action for ${cleanInstruments.length} instrument(s)`)
        console.log(`Start cleaning the mission ${missionContext.name}...`)
        const cleanActions = cleanInstruments.map(instrument => (<DefaultAction>instrument.actions.get(cleanActionKey)))
            .filter(cleanAction => cleanAction != null)
        cleanActions.forEach(cleanAction => runCleanAction(cleanAction))
        console.log(`Mission ${missionContext.name} was cleaned successfully.`)
    }
}

export async function verifyMission(missionFilePath?: string, verbose = false): Promise<void> {
    const missionPath = findMissionFile(missionFilePath)
    if (missionPath) {
        loadAndParseData(missionPath)
        const verifyInstruments = getMissionScopedInstrumentsWithAction(verifyActionKey)
        logExecutionOrder(verifyInstruments)
        if (verbose)
            console.log(`[verbose] Running '${verifyActionKey}' action for ${verifyInstruments.length} instrument(s)`)
        console.log(`Start verifying the mission ${missionContext.name}...`)
        await runVerifyActionsAndGetReport(verifyInstruments, verbose)
        generateDoctorReportLogs()
    }
}

export function packMission(missionFilePath?: string, verbose = false): void {
    const missionPath = findMissionFile(missionFilePath)
    if (missionPath) {
        loadAndParseData(missionPath)
        const packInstruments = getMissionScopedInstrumentsWithAction(packageActionKey)
        logExecutionOrder(packInstruments)
        if (verbose)
            console.log(`[verbose] Running '${packageActionKey}' action for ${packInstruments.length} instrument(s)`)
        console.log(`Start packing the mission ${missionContext.name}...`)
        const archive = archiver('zip', {zlib: {level: 9}})
        packInstruments.forEach(instrument => {
            const packAction = (<DefaultAction>instrument.actions.get(packageActionKey))
            runPackageAction(instrument.id, instrument.name, archive, packAction)
        })
        archive.finalize().then()
        archive.pipe(fs.createWriteStream(missionContext.getVariable(RESULTS_ZIP_DIR)!))
        console.log(`Mission ${missionContext.name} was packed successfully.`)
    }
}

export function unpackMission(missionFilePath?: string, verbose = false): void {
    const missionPath = findMissionFile(missionFilePath)
    if (missionPath) {
        loadAndParseData(missionPath)
        console.log(`Start the unpack mission ${missionContext.name}...`)
        if (missionContext.unpackMapping.isEmpty()) {
            console.warn(`The mission ${missionContext.name} does not contain mapping.`)
            return
        }
        const unpackInstruments = getMissionScopedInstrumentsWithAction(unpackActionKey)
        logExecutionOrder(unpackInstruments)
        if (verbose)
            console.log(`[verbose] Running '${unpackActionKey}' action for ${unpackInstruments.length} instrument(s)`)
        getUnpackTargets().forEach(targetPath => {
            const archiveName = path.basename(targetPath).split('.')[0]
            console.log(`Unpacking ${archiveName}...`)
            const zip = new AdmZip(targetPath)
            const unpackedDirPath = path.resolve(`./${path.basename(targetPath)}-results`)
            zip.extractAllTo(unpackedDirPath, true)
            const initialMissionName = missionContext.missionNameInZipFile ? archiveName : extractInitialMissionName(unpackedDirPath)
            unpackInstruments
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

export async function summaryMission(missionFilePath?: string, verbose = false): Promise<void> {
    const missionPath = findMissionFile(missionFilePath)
    if (missionPath) {
        loadAndParseData(missionPath)
        const summaryInstruments = getMissionScopedInstrumentsWithAction(summaryActionKey)
        logExecutionOrder(summaryInstruments)
        console.log(`Running summary actions for mission ${missionContext.name}...`)
        for (let i = 0; i < summaryInstruments.length; i++) {
            const instrument = summaryInstruments[i]
            const summaryAction = instrument.actions.get(summaryActionKey) as DefaultAction | undefined
            if (summaryAction) {
                logSummaryToolStart(i + 1, summaryInstruments.length, instrument.name)
                const instrumentSummary = new InstrumentSummary()
                missionContext.missionSummary.addInstrumentSummary(instrument.name, instrumentSummary)
                const startTime = performance.now()
                await runSummaryAction(summaryAction, instrument.instrumentPath, instrument.id, verbose)
                const endTime = performance.now()
                instrumentSummary.runningTime = getTimeInSeconds(startTime, endTime)
                instrumentSummary.finishedAt = getCurrentDateTime()
                logSummaryToolEnd(i + 1, summaryInstruments.length, instrument.name, instrumentSummary.runningTime)
            }
        }
        console.log(`Summary actions for mission ${missionContext.name} completed.`)
    }
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

export async function findAndRunMission(actions: string[] | undefined, verbose = false): Promise<void> {
    const missionFilePath = findMissionFile()
    if (missionFilePath == null)
        console.error('Mission YAML file could not be found in the current directory. Please specify the path of the file or make sure the name of the mission is \'mission.yml\'.')
    else
        await runMission(missionFilePath, actions, verbose)
}

export async function runMission(missionFilePath: string, actions: string[] | undefined, verbose = false): Promise<void> {
    const startTime = performance.now()

    loadAndParseData(missionFilePath)

    const instruments = getMissionScopedInstruments()
    logExecutionOrder(instruments)
    missionContext.logsStream = getLogsStream()
    let archive: Archiver | null = null
    const customRun = actions != undefined
    const requireVerifyActionReport = customRun ? !!actions.includes(verifyActionKey) : false
    const requirePackaging = customRun ? !!actions.includes(packageActionKey) : true

    if (requirePackaging)
        archive = archiver('zip', {zlib: {level: 9}})

    await runInstruments(instruments, actions, archive, customRun, verbose)
    const endTime = performance.now()

    missionContext.missionSummary.runningTime = getTimeInSeconds(startTime, endTime)
    if (requireVerifyActionReport)
        generateDoctorReportLogs()
    if (requirePackaging) {
        const missionLockFilePath = generateMissionLockFile(instruments)
        addLogsAndHtmlReportToArchive(instruments, archive!)
        addMissionYmlToArchive(missionFilePath, archive!)
        addMissionLockFileToArchive(missionLockFilePath, archive!)
        archive!.finalize().then(() => cleanLogsAndHtmlFileFromDisk(instruments))
        archive!.pipe(fs.createWriteStream(missionContext.getVariable(RESULTS_ZIP_DIR)!))
    }
    generateMissionSummary()
    missionContext.logsStream.close()
}

async function runInstruments(instruments: Instrument[], actions: string[] | undefined, archive: Archiver | null, customRun: boolean, verbose = false) {
    for (const instrument of instruments) {
        await runInstrument(instrument, archive, customRun, actions, verbose)
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
    const missionLockFilePath = getMissionLockFilePath()
    if (fs.existsSync(missionLockFilePath))
        fs.unlinkSync(missionLockFilePath)
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

function addMissionLockFileToArchive(missionLockFilePath: string, archive: archiver.Archiver): void {
    if (fs.existsSync(missionLockFilePath))
        archive.file(missionLockFilePath, {name: path.basename(missionLockFilePath)})
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

function getMissionScopedInstruments(): Instrument[] {
    if (missionContext.runAll)
        return missionContext.instruments

    const runnableSet = new Set(missionContext.runnableInstruments)
    return missionContext.instruments.filter(instrument => runnableSet.has(instrument.id))
}

function getMissionScopedInstrumentsWithAction(actionKey: string): Instrument[] {
    return getMissionScopedInstruments().filter(instrument => instrument.actions.has(actionKey))
}

function logExecutionOrder(instruments: Instrument[]): void {
    console.log('Instrument execution order:')
    if (instruments.length === 0) {
        console.log('  (none)')
        return
    }

    instruments.forEach((instrument, index) => {
        console.log(`  ${index + 1}. ${instrument.name} (runOrder: ${instrument.runOrder})`)
    })
}

function logSummaryToolStart(index: number, total: number, instrumentName: string): void {
    console.log('')
    console.log('='.repeat(86))
    console.log(`[summary ${index}/${total}] ${instrumentName}`)
    console.log('-'.repeat(86))
}

function logSummaryToolEnd(index: number, total: number, instrumentName: string, runningTime: string): void {
    console.log('-'.repeat(86))
    console.log(`[summary ${index}/${total}] ${instrumentName} finished in ${runningTime}`)
    console.log('='.repeat(86))
}
