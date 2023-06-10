import {Instrument} from '../model/Instrument'
import {missionContext} from '../context/MissionContext'
import {loadAndParseData} from '../parser/data-parser'
import {cleanActionKey, packageActionKey, unpackActionKey, verifyActionKey} from './action-utils'
import {DefaultAction} from '../model/Action'
import {runCleanAction} from './default-actions/clean-action-runner'
import archiver, {Archiver} from 'archiver'
import fs from 'fs'
import {getLogFilePath, getLogsStream, getTimeInSeconds} from '../report/logs-collector-utils'
import {generateMissionSummary} from '../report/mission-summary-generator'
import path from 'node:path'
import {generateHtmlReport} from '../report/html/html-report-generator'
import {getHtmlFilePath, getHtmlLogContent} from '../report/html/html-report-utils'
import {runInstrument} from './instrument-runner'
import {runVerifyActionsAndGetReport} from './default-actions/verify-action-runner'
import {generateDoctorReportLogs} from '../report/doctor-summary-generator'
import {RESULTS_UNPACK_DIR, RESULTS_ZIP_DIR} from '../context/context-variable-provider'
import AdmZip from 'adm-zip'
import {runUnpackAction} from './default-actions/unpack-action-runner'
import {runPackageAction} from './default-actions/package-action-runner'


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
            const packAction = (<DefaultAction>instrument.actions.get(unpackActionKey))
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
        console.log(`Start unpacking the mission ${missionContext.name}...`)
        const zip = new AdmZip(<string>missionContext.getVariable(RESULTS_ZIP_DIR))
        zip.extractAllTo(<string>missionContext.getVariable(RESULTS_UNPACK_DIR), true)
        const unpackActions = missionContext.instruments.map(instrument => (<DefaultAction>instrument.actions.get(unpackActionKey)))
            .filter(unpackAction => unpackAction != null)
        unpackActions.forEach(unpackAction => runUnpackAction(unpackAction))
        console.log(`Mission ${missionContext.name} was unpacked successfully.`)
    }
}

export function findMissionFile(missionFilePath?: string): string | null {
    if (missionFilePath)
        return missionFilePath
    console.log('!!!!!!!!!!!!!!here')
    const files = fs.readdirSync(__dirname) // Read all files in the current directory
    const missionFile = files.find((file) => file === 'mission.yml') // Find the mission.yml file
    console.log('missionFile=', missionFile)
    if (missionFile) {
        return path.join(__dirname, missionFile) // Return the full path to the mission.yml file
    }

    return null // Return null if mission.yml file doesn't exist
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
    const htmlReport = generateHtmlReport()
    addHtmlToArchive(instruments, archive)
    if (fs.existsSync(htmlReport))
        archive.file(htmlReport, {name: path.basename(htmlReport)})
    const missionLogFilePath = getLogFilePath(missionContext.name)
    if (fs.existsSync(missionLogFilePath))
        archive.file(missionLogFilePath, {name: path.basename(missionLogFilePath)})
}

function addHtmlToArchive(instruments: Instrument[], archive: archiver.Archiver): void {
    instruments.map(instrument => instrument.name).forEach(instrumentName => {
        const instrumentLogFile = getLogFilePath(instrumentName)
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