import {execSync, ExecSyncOptionsWithStringEncoding} from 'child_process'
import {Command, CommandContext} from '../model/Command'
import {osType} from '@dxworks/cli-common'
import {WithAction} from '../model/Action'
import fs from 'fs'
import path from 'node:path'
import {missionContext} from '../context/mission-context'

export function runCommand(commandContext: CommandContext, commandPath: string, instrumentName: string): void {
    const env = createEnv(commandContext.environment)
    const command = typeof commandContext.command == 'string' ? <string>commandContext.command : translateCommand(<Command>commandContext.command)
    executeCommand(command, env, commandPath, commandContext.with, generateLogFilePath(instrumentName))
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

function generateLogFilePath(instrumentName: string) {
    return path.join(<string>missionContext.getVariable('firstWorkingDir'), instrumentName + '.txt')
}

function executeCommand(
    command: string | undefined,
    env: NodeJS.ProcessEnv,
    path: string,
    withActions?: WithAction,
    logFilePath?: string
): void {
    if (!command) {
        console.warn('warn: No command defined for platform')
        return
    }
    try {
        const options: ExecSyncOptionsWithStringEncoding = {
            env: env,
            cwd: path,
            encoding: 'utf-8',
            stdio: ['ignore', 'pipe', 'pipe'],
        }
        const childProcess = execSync(command, options)

        const output = childProcess.toString()
        console.log('output: ', output)

        if (missionContext.getLogsStream() != null) {
            missionContext.getLogsStream()?.write(output)
        }
        if (logFilePath) {
            fs.writeFileSync(logFilePath, output, {flag: 'a'})
        }

        // Output logs to the console
        process.stdout.write(output)


    } catch (error: any) {
        if (
            withActions &&
            withActions.validExitCodes &&
            !withActions.validExitCodes.includes(error.status)
        ) {
            console.log(`error: ${error.message}`)
        }
    }
}
