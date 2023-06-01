import {Instrument} from '../model/Instrument'
import {runCommand} from './command-runner'
import {missionContext} from '../context/mission-context'
import {loadAndParseData} from '../parser/data-parser'
import {cleanActionKey, packageActionKey, startActionKey} from '../utils/ActionConstants'
import {Action, CustomAction, DefaultAction, instanceOfDefaultAction} from '../model/Action'
import {runPackageAction} from './default-commands/package-command-runner'
import {runCleanAction} from './default-commands/clean-command-runner'
import archiver, {Archiver} from 'archiver'
import fs from 'fs'
import {getLogFilePath, getLogsStream} from '../utils/logs_collector'
import {InstrumentSummary} from '../model/summary/InstrumentSummary'
import {logSummary} from '../utils/summary_generator'
import path from 'node:path'
import {generateHtmlReport, getHtmlLogContent} from '../utils/html-report-generator'
import {getHtmlFilePath} from '../utils/summary-html-utils'


export async function cleanMission(missionFilePath: string): Promise<void> {
    loadAndParseData(missionFilePath)
    const cleanActions = missionContext.instruments.map(instrument => (<DefaultAction>instrument.actions.get(packageActionKey)))
        .filter(cleanAction => cleanAction != null)
    cleanActions.forEach(cleanAction => runCleanAction(cleanAction))
}

export async function runMission(missionFilePath: string, actions: string[] | undefined): Promise<void> {
    const startTime = performance.now()

    function getRunnableInstruments() {
        return <Instrument[]>missionContext.runnableInstruments.map(runnableInstrument => missionContext.instruments.find((instrument) => instrument.id == runnableInstrument))
            .filter(instrument => !!instrument)
    }

    loadAndParseData(missionFilePath)
    const logStream = getLogsStream(missionContext.getName())
    missionContext.setLogsStream(logStream)
    const instruments = missionContext.runAll ? missionContext.instruments : getRunnableInstruments()
    if (actions != null) {
        await runActions(instruments, actions)
    } else {
        await runStartAndPackResults(instruments)
    }
    const endTime = performance.now()
    missionContext.getMissionSummary().runningTime = ((endTime - startTime) / 1000).toFixed(1) + 's'
    logSummary()
    logStream.close()
}

function missionCleanup(instruments: Instrument[]): void {
    instruments.map(instrument => instrument.name).forEach(instrumentName => {
        const instrumentLogFilePath = getLogFilePath(instrumentName)
        if (fs.existsSync(instrumentLogFilePath))
            fs.unlinkSync(instrumentLogFilePath)
        const instrumentHtmlFilePath = getHtmlFilePath(instrumentName)
        if (fs.existsSync(instrumentHtmlFilePath))
            fs.unlinkSync(instrumentHtmlFilePath)
    })
    const missionLogFilePath = getLogFilePath(missionContext.getName())
    if (fs.existsSync(missionLogFilePath))
        fs.unlinkSync(missionLogFilePath)
    const missionHtmlFilePath = getHtmlFilePath(missionContext.getName())
    if (fs.existsSync(missionHtmlFilePath))
        fs.unlinkSync(missionHtmlFilePath)

    const missionReportHtml = getHtmlFilePath('MissionReport')
    if (fs.existsSync(missionReportHtml))
        fs.unlinkSync(missionReportHtml)
}

function addMissionReportToResult(instruments: Instrument[], archive: archiver.Archiver): void {
    const htmlReport = generateHtmlReport()
    addHtmlToArchive(instruments, archive)
    if (fs.existsSync(htmlReport))
        archive.file(htmlReport, {name: path.basename(htmlReport)})
    const missionLogFilePath = getLogFilePath(missionContext.getName())
    if (fs.existsSync(missionLogFilePath))
        archive.file(missionLogFilePath, {name: path.basename(missionLogFilePath)})
}

function addHtmlToArchive(instruments: Instrument[], archive: archiver.Archiver): void {
    instruments.map(instrument => instrument.name).forEach(instrumentName => {
        const instrumentLogFile = getLogFilePath(instrumentName)
        try {
            const fileContent = fs.readFileSync(instrumentLogFile, 'utf8')
            const instrumentHtmlFile = getHtmlFilePath(instrumentName)
            fs.writeFileSync(instrumentHtmlFile, getHtmlLogContent(fileContent))
            archive.file(instrumentHtmlFile, {name: '/html/' + path.basename(instrumentHtmlFile)})
        } catch (err) {
            console.error('Error reading/writing file:', err)
        }
    })
    try {
        const fileContent = fs.readFileSync(getLogFilePath(missionContext.getName()), 'utf8')
        const missionHtmlFile = getHtmlFilePath(missionContext.getName())
        fs.writeFileSync(missionHtmlFile, getHtmlLogContent(fileContent))
        archive.file(missionHtmlFile, {name: path.basename(missionHtmlFile)})
    } catch (err) {
        console.error('Error reading/writing file:', err)
    }
}

function runStartAndPackResults(instruments: Instrument[]) {
    const archive = archiver('zip', {zlib: {level: 9}})
    instruments.forEach(instrument => {
        console.log(instrument.name + ' is running...')
        const startTime = performance.now()
        const instrumentSummary = new InstrumentSummary()
        missionContext.getMissionSummary().addInstrumentSummary(instrument.name, instrumentSummary)
        runCustomAction(<CustomAction>instrument.actions.get(startActionKey)!, instrument.instrumentPath, instrument.name)
        const packAction = <DefaultAction>instrument.actions.get(packageActionKey)
        if (packAction) {
            runPackageAction(instrument.name, archive, packAction)
        }
        const endTime = performance.now()
        instrumentSummary.runningTime = ((endTime - startTime) / 1000).toFixed(1) + 's'
        console.log('Finished running ', instrument.name)
    })
    addMissionReportToResult(instruments, archive)
    archive.finalize().then(() => missionCleanup(instruments))
    archive.pipe(fs.createWriteStream('voyager2-results.zip'))
}

async function runActions(instruments: Instrument[], actionsKey: string[]) {
    let archive: Archiver | null = null
    const resultsPackageRequired = actionsKey.includes(packageActionKey)
    if (resultsPackageRequired)
        archive = archiver('zip', {zlib: {level: 9}})
    for (const instrument of instruments) {
        console.log(instrument.name + ' is running...')
        const instrumentSummary = new InstrumentSummary()
        missionContext.getMissionSummary().addInstrumentSummary(instrument.name, instrumentSummary)
        const startTime = performance.now()
        const actions = actionsKey
            .map(actionKey => instrument.actions.get(actionKey))
            .filter(action => action != null)
        for (const action of actions)
            await runAction(action!, archive, instrument.name, instrument.instrumentPath)
        const endTime = performance.now()
        instrumentSummary.runningTime = ((endTime - startTime) / 1000).toFixed(1) + 's'
        console.log('Finished running ', instrument.name)
    }
    if (resultsPackageRequired) {
        addMissionReportToResult(instruments, archive!)
        archive!.finalize().then(() => missionCleanup(instruments))
        archive!.pipe(fs.createWriteStream('voyager2-results.zip'))
    }
}


async function runAction(action: Action, archive: null | archiver.Archiver, instrumentName: string, instrumentPath: string) {
    if (instanceOfDefaultAction(action))
        await runDefaultAction(<DefaultAction>action, archive, instrumentName)
    else
        runCustomAction(<CustomAction>action, instrumentName, instrumentPath)
}

function runCustomAction(action: CustomAction, instrumentPath: string, instrumentName: string) {
    action.commandsContext.forEach((commandContext) => runCommand(commandContext, commandContext.dir ? commandContext.dir : instrumentPath, instrumentName))
}

async function runDefaultAction(action: DefaultAction, archive: archiver.Archiver | null, instrumentName: string) {
    switch (action.name) {
        case cleanActionKey: {
            await runCleanAction(action)
            break
        }
        case packageActionKey: {
            runPackageAction(instrumentName!, archive!, action)
            break
        }
    }
}
