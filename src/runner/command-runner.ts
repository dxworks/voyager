import {Command, CommandContext} from '../model/Command'
import {osType} from '@dxworks/cli-common'
import {missionContext} from '../context/mission-context'
import {execSync, ExecSyncOptionsWithStringEncoding} from 'child_process'
import fs from 'fs'
import {WithAction} from '../model/Action'
import {CommandSummary} from '../model/summary/CommandSummary'
import {getLogFilePath} from '../utils/logs_collector'


export function runCommand(commandContext: CommandContext,
                           commandPath: string,
                           instrumentName: string): void {
    const env = createEnv(commandContext.environment)
    const command = typeof commandContext.command == 'string' ? <string>commandContext.command : translateCommand(<Command>commandContext.command)
    const withActions = commandContext.with
    const instrumentSummary = missionContext.getMissionSummary().getInstrumentSummary(instrumentName)
    const startTime = performance.now()
    const commandSummary = new CommandSummary()
    try {
        executeCommand(command, env, commandPath, commandContext.with, getLogFilePath(instrumentName))
    } catch (error: any) {
        if (
            withActions &&
            withActions.validExitCodes &&
            !withActions.validExitCodes.includes(error.status)
        ) {
            commandSummary.success = false
            console.log(`error: ${error.message}`)
        }
    }
    const endTime = performance.now()
    commandSummary.runningTime = ((endTime - startTime) / 1000).toFixed(1) + 's'
    instrumentSummary.addCommandSummary(commandContext.id, commandSummary)
}

function translateCommand(command: Command): string | undefined {
    switch (osType) {
        case 'windows':
            return command.windows
        case 'linux':
            return command.linux ? command.linux : command.unix
        case 'mac':
            return command.mac ? command.mac : command.unix
    }
}

function createEnv(environmentVariables?: Map<string, string>) {
    if (environmentVariables != null && environmentVariables.size != 0) {
        const env = Object.fromEntries(environmentVariables)
        return Object.assign({}, env, process.env)
    } else
        return process.env
}

function executeCommand(command: string | undefined, env: NodeJS.ProcessEnv,
                        path: string,
                        withActions?: WithAction,
                        logFilePath?: string) {
    if (!command) {
        console.warn('warn: No command defined for platform')
        return
    }
    const options: ExecSyncOptionsWithStringEncoding = {
        env: env,
        cwd: path,
        encoding: 'utf-8',
        stdio: ['ignore', 'pipe', 'pipe'],
    }
    const childProcess = execSync(command, options)

    const output = childProcess.toString()

    if (missionContext.getLogsStream() != null) {
        missionContext.getLogsStream()?.write(output)
    }
    if (logFilePath) {
        fs.writeFileSync(logFilePath, output, {flag: 'a'})
    }

    // Output logs to the console
    process.stdout.write(output)
}
