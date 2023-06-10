import {Archiver} from 'archiver'
import {cleanActionKey, packageActionKey, verifyActionKey} from './action-utils'
import {Action, DefaultAction, instanceOfDefaultAction} from '../model/Action'
import {runCommand} from './command-runner'
import {runCleanAction} from './default-actions/clean-action-runner'
import {runPackageAction} from './default-actions/package-action-runner'
import {runVerifyAction} from './default-actions/verify-action-runner'


export async function runAction(action: Action, archive: Archiver | null, instrumentName: string, instrumentPath: string): Promise<void> {
    if (instanceOfDefaultAction(action))
        await runDefaultAction(<DefaultAction>action, archive, instrumentName)
    else
        await runCustomAction(action, instrumentPath, instrumentName)
}

async function runCustomAction(action: Action, instrumentPath: string, instrumentName: string) {
    for (const commandContext of action.commandsContext!) {
        await runCommand(commandContext, commandContext.dir ? commandContext.dir : instrumentPath, instrumentName)
    }
}

async function runDefaultAction(action: DefaultAction, archive: Archiver | null, instrumentName: string) {
    switch (action.name) {
        case cleanActionKey: {
            await runCleanAction(action)
            break
        }
        case packageActionKey: {
            runPackageAction(instrumentName!, archive!, action)
            break
        }
        case verifyActionKey: {
            await runVerifyAction(action, instrumentName)
            break
        }
    }
}