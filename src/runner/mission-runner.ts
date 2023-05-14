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


export async function cleanMission(missionFilePath: string): Promise<void> {
    loadAndParseData(missionFilePath)
    const cleanActions = missionContext.instruments.map(instrument => (<DefaultAction>instrument.actions.get(packageActionKey)))
        .filter(cleanAction => cleanAction != null)
    cleanActions.forEach(cleanAction => runCleanAction(cleanAction))
}

export async function runMission(missionFilePath: string, actions: string[] | undefined): Promise<void> {
    function getRunnableInstruments() {
        return <Instrument[]>missionContext.runnableInstruments.map(runnableInstrument => missionContext.instruments.find((instrument) => instrument.id == runnableInstrument))
            .filter(instrument => !!instrument)
    }

    loadAndParseData(missionFilePath)
    const instruments = missionContext.runAll ? missionContext.instruments : getRunnableInstruments()
    if (actions != null) {
        await runActions(instruments, actions)
    } else {
        await runStartAndPackResults(instruments)
    }
}

function runStartAndPackResults(instruments: Instrument[]) {
    const archive = archiver('zip', {zlib: {level: 9}})
    instruments.forEach(instrument => {
        console.log(instrument.name + ' is running...')
        runCustomAction(<CustomAction>instrument.actions.get(startActionKey)!, instrument.instrumentPath)
        const packAction = <DefaultAction>instrument.actions.get(packageActionKey)
        if (packAction)
            runPackageAction(instrument.name, archive, packAction)
    })
    archive.finalize().then()
    archive.pipe(fs.createWriteStream('voyager2-results.zip'))
}

async function runActions(instruments: Instrument[], actionsKey: string[]) {
    let archive: Archiver | null = null
    const resultsPackageRequired = actionsKey.includes(packageActionKey)
    if (resultsPackageRequired)
        archive = archiver('zip', {zlib: {level: 9}})
    for (const instrument of instruments) {
        const actions = actionsKey
            .map(actionKey => instrument.actions.get(actionKey))
            .filter(action => action != null)
        for (const action of actions)
            await runAction(action!, archive, instrument.name, instrument.instrumentPath)
    }
    if (resultsPackageRequired) {
        archive!.finalize().then()
        archive!.pipe(fs.createWriteStream('voyager2-results.zip'))
    }
}


async function runAction(action: Action, archive: null | archiver.Archiver, instrumentName: string, instrumentPath: string) {
    if (instanceOfDefaultAction(action))
        await runDefaultAction(<DefaultAction>action, archive, instrumentName)
    else
        runCustomAction(<CustomAction>action, instrumentPath)
}

function runCustomAction(action: CustomAction, instrumentPath: string) {
    action.commandsContext.forEach((commandContext) => runCommand(commandContext, commandContext.dir ? commandContext.dir : instrumentPath))
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
