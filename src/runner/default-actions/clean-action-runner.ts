import {DefaultAction} from '../../model/Action'
import path from 'node:path'
import {missionContext} from '../../context/MissionContext'
import {INSTRUMENTS_DIR} from '../../context/context-variable-provider'
import fs from 'fs'

export async function runCleanAction(cleanAction: DefaultAction): Promise<void> {
    const locations = cleanAction.with.locations!
    for (const location of locations) {
        const sourcePath = path.resolve(missionContext.getVariable(INSTRUMENTS_DIR)!, location.source)
        if (location.files) {
            location.files.forEach(file => {
                const filePath = path.resolve(sourcePath, file)
                if (fs.existsSync(filePath))
                    fs.unlinkSync(filePath)
            })
        } else if (fs.existsSync(sourcePath))
            await deleteFolder(sourcePath)
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