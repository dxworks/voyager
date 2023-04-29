import {Archiver} from 'archiver'
import {DefaultAction, Location} from '../../model/Action'
import path from 'node:path'
import {missionContext} from '../../context/mission-context'
import {INSTRUMENTS_DIR} from '../../context/context-variable-provider'
import fs from 'fs'

export function runPackageAction(instrumentName: string, archive: Archiver, action: DefaultAction): void {
    const instrumentResultsDirectory = instrumentName
    const locations: Location[] = action.with.locations!
    locations.forEach(location => {
        const destinationDirectory = location.destination ? path.join(instrumentResultsDirectory, location.destination) : instrumentResultsDirectory
        const sourcePath = path.resolve(missionContext.getVariable(INSTRUMENTS_DIR)!, location.source)
        if (location.files) {
            location.files.forEach(file => {
                const filePath = path.resolve(sourcePath, file)
                if (fs.existsSync(filePath)) {
                    const stat = fs.statSync(filePath)
                    if (stat.isFile())
                        archive.file(filePath, {name: path.join(destinationDirectory, file)})
                }
            })
        } else if (fs.existsSync(sourcePath))
            archive.directory(sourcePath, destinationDirectory)
    })
}