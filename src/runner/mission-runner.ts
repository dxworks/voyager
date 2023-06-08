import {Instrument} from '../model/Instrument'
import {missionContext} from '../context/MissionContext'
import {loadAndParseData} from '../parser/data-parser'
import {cleanActionKey, packageActionKey, verifyActionKey} from './action-utils'
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


export async function cleanMission(missionFilePath: string): Promise<void> {
    loadAndParseData(missionFilePath)
    const cleanActions = missionContext.instruments.map(instrument => (<DefaultAction>instrument.actions.get(cleanActionKey)))
        .filter(cleanAction => cleanAction != null)
    cleanActions.forEach(cleanAction => runCleanAction(cleanAction))
}

export async function verifyMission(missionFilePath: string): Promise<void> {
    loadAndParseData(missionFilePath)
    await runVerifyActionsAndGetReport()
    generateDoctorReportLogs()
}

export async function runMission(missionFilePath: string, actions: string[] | undefined): Promise<void> {
    const startTime = performance.now()

    function getRunnableInstruments() {
        return <Instrument[]>missionContext.runnableInstruments.map(runnableInstrument => missionContext.instruments.find((instrument) => instrument.id == runnableInstrument))
            .filter(instrument => !!instrument)
    }

    loadAndParseData(missionFilePath)
    const instruments = missionContext.runAll ? missionContext.instruments : getRunnableInstruments()
    missionContext.logsStream = getLogsStream()
    await runInstruments(instruments, actions)
    const endTime = performance.now()

    missionContext.missionSummary.runningTime = getTimeInSeconds(startTime, endTime)
    generateMissionSummary()
    missionContext.logsStream.close()
}

async function runInstruments(instruments: Instrument[], actions: string[] | undefined) {
    let archive: Archiver | null = null
    const customRun = actions != undefined
    const requireVerifyActionReport = customRun ? !!actions.includes(verifyActionKey) : false
    const requirePackaging = customRun ? !!actions.includes(packageActionKey) : true
    if (requirePackaging)
        archive = archiver('zip', {zlib: {level: 9}})
    for (const instrument of instruments) {
        await runInstrument(instrument, archive, customRun, actions)
    }
    if (requireVerifyActionReport)
        generateDoctorReportLogs()
    if (requirePackaging) {
        addLogsAndHtmlReportToArchive(instruments, archive!)
        archive!.finalize().then(() => cleanLogsAndHtmlFileFromDisk(instruments))
        archive!.pipe(fs.createWriteStream(missionContext.getResultsArchiveName()))
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

function addLogsAndHtmlReportToArchive(instruments: Instrument[], archive: archiver.Archiver): void {
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
            fs.writeFileSync(instrumentHtmlFile, getHtmlLogContent(instrumentName,fileContent))
            archive.file(instrumentHtmlFile, {name: '/html/' + path.basename(instrumentHtmlFile)})
        } catch (err) {
            console.error('Error reading/writing file:', err)
        }
    })
    try {
        const fileContent = fs.readFileSync(getLogFilePath(missionContext.name), 'utf8')
        const missionHtmlFile = getHtmlFilePath(missionContext.name)
        fs.writeFileSync(missionHtmlFile, getHtmlLogContent(missionContext.name,fileContent))
        archive.file(missionHtmlFile, {name: '/html/' + path.basename(missionHtmlFile)})
    } catch (err) {
        console.error('Error reading/writing file:', err)
    }
}