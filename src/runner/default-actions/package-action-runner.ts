import {Archiver} from 'archiver'
import {DefaultAction, Location} from '../../model/Action'
import path from 'node:path'
import {missionContext} from '../../context/MissionContext'
import {INSTRUMENTS_DIR} from '../../context/context-variable-provider'
import fs from 'fs'
import {getLogFilePath} from '../../report/logs-collector-utils'
import {getMatchingFilesFromDir} from '../action-utils'

export function runPackageAction(instrumentName: string, archive: Archiver, action: DefaultAction): void {
    addLogFileToArchive(getLogFilePath(instrumentName), archive)
    const instrumentResultsDirectory = instrumentName
    const locations: Location[] = action.with!.locations!
    locations.forEach(location => {
        const destinationDirectory = location.destination ? path.join(instrumentResultsDirectory, location.destination) : instrumentResultsDirectory
        const sourcePath = path.resolve(missionContext.getVariable(INSTRUMENTS_DIR)!, location.source)
        if (location.files) {
            const matchingFiles = getMatchingFilesFromDir(sourcePath, location.files)
            matchingFiles.forEach(file => {
                const filePath = path.resolve(sourcePath, file)
                archive.file(filePath, {name: path.join(destinationDirectory, file)})
            })
        } else if (fs.existsSync(sourcePath))
            archive.directory(sourcePath, destinationDirectory)
    })
}

function addLogFileToArchive(logFilePath: string, archive: Archiver): void {
    if (fs.existsSync(logFilePath))
        archive.file(logFilePath, {name: path.basename(logFilePath)})
}