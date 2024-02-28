import {Command, CommandContext} from '../model/Command'
import {OS, osType} from '@dxworks/cli-common'
import {missionContext} from '../context/MissionContext'
import {spawn, SpawnOptions} from 'child_process'
import fs from 'fs'
import {CommandSummary} from '../model/summary/CommandSummary'
import {getLogFilePath, getTimeInSeconds} from '../report/logs-collector-utils'
import {centerText, maxLength} from '../report/mission-summary-generator'

export async function runCommand(commandContext: CommandContext,
                                 commandPath: string,
                                 instrumentName: string): Promise<void> {
    const instrumentSummary = missionContext.missionSummary.getInstrumentSummary(instrumentName)
    const startTime = performance.now()
    const commandSummary = new CommandSummary()
    try {
        await executeCommand(commandContext, commandPath, getLogFilePath(instrumentName))
    } catch (e) {
        console.error(e)
        commandSummary.success = false
    }
    const endTime = performance.now()
    commandSummary.runningTime = getTimeInSeconds(startTime, endTime)
    instrumentSummary.addCommandSummary(commandContext.id, commandSummary)
}

export function translateCommand(command: Command): string | undefined {
    switch (osType) {
        case OS.WINDOWS:
            return command.windows
        case OS.LINUX:
            return command.linux ? command.linux : command.unix
        case OS.MAC:
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
    const options: SpawnOptions = {
        env: env,
        cwd: path,
        stdio: ['ignore', 'pipe', 'pipe'],
        shell: true,
    }
    console.log(centerText('Running command', maxLength, '*'))
    console.log('The command: "', command, '" is now running \n')
    return new Promise((resolve, reject) => {
        const childProcess = spawn(command!, options)

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
    if (missionContext.logsStream != null) {
        missionContext.logsStream!.write(logs)
    }
    if (logFilePath) {
        fs.writeFileSync(logFilePath, logs, {flag: 'a'})
    }
    // Output logs to the console
    process.stdout.write(logs)
}