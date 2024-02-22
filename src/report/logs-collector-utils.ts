import path from 'node:path'
import fs from 'fs'
import {missionContext} from '../context/MissionContext'
import {VOYAGER_WORKING_DIR} from '../context/context-variable-provider'

export function getLogFilePath(instrumentName: string): string {
    return path.join(<string>missionContext.getVariable(VOYAGER_WORKING_DIR), instrumentName + '.log')
}

export function getTimeInSeconds(startTime: number, endTime: number): string {
    return ((endTime - startTime) / 1000).toFixed(1) + 's'
}

export function getLogsStream(): fs.WriteStream {
    const logFilePath = getLogFilePath(missionContext.name)
    const logStream = fs.createWriteStream(logFilePath, {flags: 'a'})

    // Override the default console.log and console.error functions
    const originalLog = console.log
    const originalError = console.error

    console.log = (...args: any[]) => {
        const message = args.map(arg => arg.toString()).join(' ')
        originalLog(...args)
        logStream.write(`${message}\n`)
    }

    console.error = (...args: any[]) => {
        const message = args.map(arg => arg.toString()).join(' ')
        originalError(...args)
        logStream.write(`Error: ${message}\n`)
    }

    return logStream
}
