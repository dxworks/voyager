import {Archiver} from 'archiver'
import {DefaultAction, Location} from '../../model/Action'
import path from 'node:path'
import {missionContext} from '../../context/mission-context'
import {INSTRUMENTS_DIR} from '../../context/context-variable-provider'
import fs from 'fs'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const {minimatch} = require('minimatch')

export function runPackageAction(instrumentName: string, archive: Archiver, action: DefaultAction): void {
    const instrumentResultsDirectory = instrumentName
    const locations: Location[] = action.with.locations!
    locations.forEach(location => {
        const destinationDirectory = location.destination ? path.join(instrumentResultsDirectory, location.destination) : instrumentResultsDirectory
        const sourcePath = path.resolve(missionContext.getVariable(INSTRUMENTS_DIR)!, location.source)
        if (location.files) {
            const matchingFiles: string[] = []
            if (fs.existsSync(sourcePath)) {
                const files = fs.readdirSync(sourcePath)
                location.files.forEach(fileName => {
                    matchingFiles.push(...files.filter(str => {
                            return minimatch(str, fileName)
                        })
                    )
                })
                matchingFiles.forEach(file => {
                    const filePath = path.resolve(sourcePath, file)
                    archive.file(filePath, {name: path.join(destinationDirectory, file)})
                })
            }
        } else if (fs.existsSync(sourcePath))
            archive.directory(sourcePath, destinationDirectory)
    })
}