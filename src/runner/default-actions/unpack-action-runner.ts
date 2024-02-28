import {DefaultAction} from '../../model/Action'
import fs from 'fs'
import path from 'path'
import {missionContext} from '../../context/MissionContext'
import {RESULTS_UNPACK_DIR} from '../../context/context-variable-provider'

export function runUnpackAction(unpackAction: DefaultAction, mappingRequired: boolean, instrumentName: string): void {
    unpackAction.produces?.forEach((filePath, fileId) => {
        const fullPath = path.resolve(<string>missionContext.getVariable(RESULTS_UNPACK_DIR), filePath)
        if (!fs.existsSync(fullPath)) {
            console.warn(`The file ${fileId} is absent from the results archive.`)
        }
        if (mappingRequired) {
            const instrumentMappingElements = missionContext.unpackMapping.getInstrumentMapping(instrumentName)
            instrumentMappingElements.forEach((unpackElement) => {
                if (unpackElement.fileId === fileId) {
                    const destinationPath = path.resolve(unpackElement.destination)
                    if (!fs.existsSync(destinationPath)) {
                        fs.mkdirSync(destinationPath, {recursive: true})
                    }
                    const fileName = unpackElement.prefix ? unpackElement.prefix + path.basename(filePath) : path.basename(filePath)
                    fs.copyFileSync(fullPath, path.resolve(destinationPath, `${fileName}`))
                }
            })
        }
    })
}