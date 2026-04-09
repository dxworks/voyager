import {Instrument} from '../model/Instrument'
import {Archiver} from 'archiver'
import {packageActionKey, startActionKey} from './action-utils'
import {InstrumentSummary} from '../model/summary/InstrumentSummary'
import {missionContext} from '../context/MissionContext'
import {getCurrentDateTime, getTimeInSeconds} from '../report/logs-collector-utils'
import {runAction} from './action-runner'
import {DefaultAction} from '../model/Action'
import {runPackageAction} from './default-actions/package-action-runner'
import {centerText, maxLength} from '../report/mission-summary-generator'

export async function runInstrument(instrument: Instrument, archive: Archiver | null, customRun: boolean, actionsKey?: string[], verbose = false): Promise<void> {
    console.log(centerText(instrument.name + ' is running...', maxLength, '-'))
    const startTime = performance.now()
    const instrumentSummary = new InstrumentSummary()
    missionContext.missionSummary.addInstrumentSummary(instrument.name, instrumentSummary)
    if (customRun)
        await customInstrumentRun(instrument, archive, actionsKey, verbose)
    else
        await defaultInstrumentRun(instrument, archive!, verbose)
    const endTime = performance.now()
    instrumentSummary.runningTime = getTimeInSeconds(startTime, endTime)
    instrumentSummary.finishedAt = getCurrentDateTime()
    console.log(centerText('Finished running ' + instrument.name, maxLength, '-'))
}

async function defaultInstrumentRun(instrument: Instrument, archive: Archiver, verbose = false): Promise<void> {
    const startAction = instrument.actions.get(startActionKey)
    if (startAction)
        await runAction(startAction, archive, instrument.instrumentPath, instrument.name, verbose)
    else
        console.warn(`Instrument ${instrument.name}: no '${startActionKey}' action found. Skipping run phase.`)

    const packAction = <DefaultAction>instrument.actions.get(packageActionKey)
    if (packAction) {
        runPackageAction(instrument.name, archive, packAction)
    }
}

export async function customInstrumentRun(instrument: Instrument, archive: Archiver | null, actionsKey: string[] | undefined, verbose = false): Promise<void> {
    if (actionsKey != undefined) {
        const actions = actionsKey
            .map(actionKey => instrument.actions.get(actionKey))
            .filter(action => action != null)
        for (const action of actions)
            await runAction(action!, archive, instrument.instrumentPath, instrument.name, verbose)
    }
}
