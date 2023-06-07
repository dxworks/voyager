import path from 'node:path'
import fs from 'fs'
import {missionContext} from '../context/MissionContext'

export function getLogFilePath(instrumentName: string): string {
    return path.join(<string>missionContext.getVariable('firstWorkingDir'), instrumentName + '.txt')
}

export function getTimeInSeconds(startTime: number, endTime: number): string {
    return ((endTime - startTime) / 1000).toFixed(1) + 's'
}

export function getLogsStream(missionName: string): fs.WriteStream {
    const logFilePath = path.join(process.cwd(), missionName + '.txt')
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
