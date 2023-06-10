import {DefaultAction} from '../../model/Action'
import path from 'node:path'
import {missionContext} from '../../context/MissionContext'
import {INSTRUMENTS_DIR} from '../../context/context-variable-provider'
import fs from 'fs'
import {getMatchingFilesFromDir} from '../action-utils'

export async function runCleanAction(cleanAction: DefaultAction): Promise<void> {
    const locations = cleanAction.with!.locations!
    for (const location of locations) {
        const sourcePath = path.resolve(missionContext.getVariable(INSTRUMENTS_DIR)!, location.source)
        if (location.files) {
            const matchingFiles = getMatchingFilesFromDir(sourcePath, location.files)
            matchingFiles.forEach(file => {
                const filePath = path.resolve(sourcePath, file)
                fs.unlinkSync(filePath)
            })
        } else if (fs.existsSync(sourcePath))
            if (location.rmDir)
                await deleteFolder(sourcePath)
            else
                deleteDirectoryContent(sourcePath)
    }
}

async function deleteFolder(path: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        fs.rm(path, {recursive: true}, (err) => {
            if (err)
                reject(err)
            else
                resolve()
        })
    })
}

function deleteDirectoryContent(directoryPath: string): void {
    const files = fs.readdirSync(directoryPath)

    for (const file of files) {
        const filePath = `${directoryPath}/${file}`

        if (fs.statSync(filePath).isFile()) {
            fs.unlinkSync(filePath)
        } else {
            deleteDirectoryContent(filePath)
            fs.rmdirSync(filePath)
        }
    }
}