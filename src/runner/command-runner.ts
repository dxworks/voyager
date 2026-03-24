import {Command, CommandContext} from '../model/Command'
import {OS, osType} from '@dxworks/cli-common'
import {missionContext} from '../context/MissionContext'
import {spawn, SpawnOptions} from 'child_process'
import fs from 'fs'
import {CommandSummary} from '../model/summary/CommandSummary'
import {InstrumentSummary} from '../model/summary/InstrumentSummary'
import {getLogFilePath, getTimeInSeconds} from '../report/logs-collector-utils'
import {centerText, maxLength} from '../report/mission-summary-generator'
import {replaceMissionContextVariables} from '../variable/variable-operations'

interface RunCommandOptions {
    verbose?: boolean
}

export async function runCommand(commandContext: CommandContext,
                                 commandPath: string,
                                 instrumentName: string,
                                 runOptions?: RunCommandOptions): Promise<void> {
    const instrumentSummary = getOrCreateInstrumentSummary(instrumentName)
    const startTime = performance.now()
    const commandSummary = new CommandSummary()
    const commandLabel = `${instrumentName}/${commandContext.id}`
    console.log(`[command] ${commandLabel} started`)
    try {
        await executeCommand(commandContext, commandPath, getLogFilePath(instrumentName), runOptions)
    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : String(e)
        if (runOptions?.verbose)
            console.error(e)
        else
            console.warn(`[command] ${commandLabel} failed: ${errorMessage}`)
        commandSummary.success = false
    }
    const endTime = performance.now()
    commandSummary.runningTime = getTimeInSeconds(startTime, endTime)
    instrumentSummary.addCommandSummary(commandContext.id, commandSummary)
    console.log(`[command] ${commandLabel} ${commandSummary.success ? 'ok' : 'failed'} (${commandSummary.runningTime})`)
}

function getOrCreateInstrumentSummary(instrumentName: string): InstrumentSummary {
    const existingSummary = missionContext.missionSummary.instrumentsSummary.get(instrumentName)
    if (existingSummary)
        return existingSummary

    const createdSummary = new InstrumentSummary()
    missionContext.missionSummary.addInstrumentSummary(instrumentName, createdSummary)
    return createdSummary
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
        const resolvedEnvVariables = new Map<string, string>()
        environmentVariables.forEach((value, key) => {
            resolvedEnvVariables.set(key, replaceMissionContextVariables(value))
        })
        const env = Object.fromEntries(resolvedEnvVariables)
        return Object.assign({}, env, process.env)
    } else
        return process.env
}

async function executeCommand(commandContext: CommandContext,
                                 path: string,
                                 logFilePath?: string,
                                 runOptions?: RunCommandOptions): Promise<void> {
    const env = createEnv(commandContext.environment)
    const translatedCommand = typeof commandContext.command == 'string' ? <string>commandContext.command : translateCommand(<Command>commandContext.command)
    const command = translatedCommand ? replaceMissionContextVariables(translatedCommand) : translatedCommand
    const resolvedPath = replaceMissionContextVariables(path)
    if (!command) {
        console.warn('warn: No command defined for platform')
    }
    const spawnOptions: SpawnOptions = {
        env: env,
        cwd: resolvedPath,
        stdio: ['ignore', 'pipe', 'pipe'],
        shell: true,
    }
    if (runOptions?.verbose) {
        console.log(centerText('Running command', maxLength, '*'))
        console.log(`Command: ${command ?? '<undefined>'}`)
        console.log(`Working directory: ${resolvedPath}`)
        console.log('')
    }
    return new Promise((resolve, reject) => {
        const childProcess = spawn(command!, spawnOptions)

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
