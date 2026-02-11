import fs from 'fs'
import path from 'node:path'
import {DefaultAction} from '../../model/Action'
import {runCommand} from '../command-runner'

export async function runSummaryAction(
    action: DefaultAction,
    instrumentPath: string,
    instrumentName: string
): Promise<string | null> {
    const summaryFilePath = action.summaryFile
        ? path.resolve(instrumentPath, action.summaryFile)
        : null

    // If summaryFile is declared and already exists, skip commands
    if (summaryFilePath && fs.existsSync(summaryFilePath)) {
        return summaryFilePath
    }

    // Run generation commands if defined
    if (action.commandsContext && action.commandsContext.length > 0) {
        for (const commandContext of action.commandsContext) {
            await runCommand(commandContext, commandContext.dir ?? instrumentPath, instrumentName)
        }
    }

    // Return the summary file path if it was declared and now exists
    if (summaryFilePath) {
        if (fs.existsSync(summaryFilePath)) {
            return summaryFilePath
        }
        console.warn(`Instrument ${instrumentName}: summary file not found at ${summaryFilePath}`)
    }

    return null
}
