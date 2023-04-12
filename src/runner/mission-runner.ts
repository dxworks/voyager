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
        runStartAndPackResults(instruments)
    }
}

function runStartAndPackResults(instruments: Instrument[]) {
    const archive = archiver('zip', {zlib: {level: 9}})
    instruments.forEach(instrument => {
        runCustomAction(<CustomAction>instrument.actions.get(startActionKey)!)
        runPackageAction(instrument.name, archive, <DefaultAction>instrument.actions.get(packageActionKey))
    })
    archive.finalize().then()
    archive.pipe(fs.createWriteStream('voyager2-results.zip'))
}

async function runActions(instruments: Instrument[], actionsKey: string[]) {
    let archive: Archiver | null = null
    const packResultsRequired = actionsKey.includes(packageActionKey)
    console.log('actions')
    console.log(actionsKey)
    if (packResultsRequired)
        archive = archiver('zip', {zlib: {level: 9}})
    console.log(instruments)
    for (const instrument of instruments) {

        const actions = actionsKey
            .map(actionKey => instrument.actions.get(actionKey))
            .filter(action => action != null)
        console.log(actions)
        for (const action of actions) {
            console.log(action)
            await runAction(action!, archive, instrument.name)
        }
    }

    if (packResultsRequired) {
        archive!.finalize().then()
        archive!.pipe(fs.createWriteStream('voyager2-results.zip'))
    }
}


async function runAction(action: Action, archive: null | archiver.Archiver, instrumentName: string) {
    if (instanceOfDefaultAction(action))
        await runDefaultAction(<DefaultAction>action, archive, instrumentName)
    else
        runCustomAction(<CustomAction>action)
}

function runCustomAction(action: CustomAction) {
    action.commandsContext.forEach((commandContext) => runCommand(commandContext))
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
