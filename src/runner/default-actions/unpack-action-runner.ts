import {DefaultAction} from '../../model/Action'
import fs from 'fs'
import path from 'path'
import {missionContext} from '../../context/MissionContext'
import {replaceRegex} from '../../variable/variable-operations'

export function runUnpackAction(unpackAction: DefaultAction, instrumentName: string, unpackedResultsPath: string, initialMissionName: string): void {
    unpackAction.produces?.forEach((filePath, fileId) => {
        const fullPath = path.resolve(unpackedResultsPath, filePath)
        if (fs.existsSync(fullPath)) {
            const instrumentMappingElements = missionContext.unpackMapping.getInstrumentMapping(instrumentName)
            instrumentMappingElements.forEach((unpackElement) => {
                if (unpackElement.fileId === fileId) {
                    const destinationPath = path.resolve(unpackElement.destination)
                    if (!fs.existsSync(destinationPath)) {
                        fs.mkdirSync(destinationPath, {recursive: true})
                    }
                    const fileName = buildFileName(unpackElement.prefix, filePath, initialMissionName)
                    fs.copyFileSync(fullPath, path.resolve(destinationPath, `${fileName}`))
                }
            })
        } else {
            console.warn(`The file ${fileId} is absent from the results archive.`)
        }

    })
}

function buildFileName(prefix: string, filePath: string, initialMissionName: string): string {
    if (prefix === '${initialMissionName}')
        prefix = replaceRegex(prefix, () => initialMissionName)
    return prefix ? `${prefix}-${path.basename(filePath)}` : path.basename(filePath)
}