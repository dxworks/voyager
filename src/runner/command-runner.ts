import {Command, CommandContext} from '../model/Command'
import {osType} from '@dxworks/cli-common'
import {missionContext} from '../context/mission-context'
import {ExecSyncOptionsWithStringEncoding, spawn} from 'child_process'
import fs from 'fs'
import {CommandSummary} from '../model/summary/CommandSummary'
import {getLogFilePath} from '../utils/logs_collector'

export async function runCommand(commandContext: CommandContext,
                                 commandPath: string,
                                 instrumentName: string): Promise<void> {
    const instrumentSummary = missionContext.getMissionSummary().getInstrumentSummary(instrumentName)
    const startTime = performance.now()
    const commandSummary = new CommandSummary()
    try {
        await executeCommand(commandContext, commandPath, getLogFilePath(instrumentName))
    } catch (e) {
        console.error(e)
        commandSummary.success = false
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

async function executeCommand(commandContext: CommandContext,
                              path: string,
                              logFilePath?: string): Promise<void> {
    const env = createEnv(commandContext.environment)
    const command = typeof commandContext.command == 'string' ? <string>commandContext.command : translateCommand(<Command>commandContext.command)
    if (!command) {
        console.warn('warn: No command defined for platform')
    }
    const options: ExecSyncOptionsWithStringEncoding = {
        env: env,
        cwd: path,
        encoding: 'utf-8',
        stdio: ['ignore', 'pipe', 'pipe'],
    }
    const [commandKey, ...args] = command!.split(' ')

    return new Promise((resolve, reject) => {
        const childProcess = spawn(commandKey, args, options)

        childProcess.stdout?.on('data', (data) => {
            const logs = data.toString()
            writeLogs(logs, logFilePath)
        })

        childProcess.stderr?.on('data', (data) => {
            const errorOutput = data.toString()
            writeLogs(errorOutput, logFilePath)
        })

        childProcess.on('error', (error) => {
            console.log('Command execution error:', error)
            writeLogs(error.message, logFilePath)
            reject(error)
        })

        childProcess.on('close', (code) => {
            if (code && commandContext.with?.validExitCodes?.includes(code) || code == 0) {
                resolve()
            } else {
                reject(new Error(`Command execution failed with exit code: ${code}`))
            }
        })
    })

}

function writeLogs(logs: string, logFilePath: string | undefined) {
    if (missionContext.getLogsStream() != null) {
        missionContext.getLogsStream()!.write(logs)
    }
    if (logFilePath) {
        fs.writeFileSync(logFilePath, logs, {flag: 'a'})
    }
    // Output logs to the console
    process.stdout.write(logs)
}
