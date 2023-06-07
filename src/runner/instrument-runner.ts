import {Instrument} from '../model/Instrument'
import {Archiver} from 'archiver'
import {packageActionKey, startActionKey} from './action-utils'
import {InstrumentSummary} from '../model/summary/InstrumentSummary'
import {missionContext} from '../context/MissionContext'
import {getTimeInSeconds} from '../report/logs-collector-utils'
import {runAction} from './action-runner'
import {DefaultAction} from '../model/Action'
import {runPackageAction} from './default-actions/package-action-runner'

export async function runInstrument(instrument: Instrument, archive: Archiver | null, customRun: boolean, actionsKey?: string[]): Promise<void> {
    console.log(instrument.name + ' is running...')
    const startTime = performance.now()
    const instrumentSummary = new InstrumentSummary()
    missionContext.missionSummary.addInstrumentSummary(instrument.name, instrumentSummary)
    if (customRun)
        await customInstrumentRun(instrument, archive, actionsKey)
    else
        await defaultInstrumentRun(instrument, archive!)
    const endTime = performance.now()
    instrumentSummary.runningTime = getTimeInSeconds(startTime, endTime)
    console.log('Finished running ', instrument.name)
}

async function defaultInstrumentRun(instrument: Instrument, archive: Archiver): Promise<void> {
    await runAction(instrument.actions.get(startActionKey)!, archive, instrument.instrumentPath, instrument.name)
    const packAction = <DefaultAction>instrument.actions.get(packageActionKey)
    if (packAction) {
        runPackageAction(instrument.name, archive, packAction)
    }
}

export async function customInstrumentRun(instrument: Instrument, archive: Archiver | null, actionsKey: string[] | undefined): Promise<void> {
    if (actionsKey != undefined) {
        const actions = actionsKey
            .map(actionKey => instrument.actions.get(actionKey))
            .filter(action => action != null)
        for (const action of actions)
            await runAction(action!, archive, instrument.name, instrument.instrumentPath)
    }
}