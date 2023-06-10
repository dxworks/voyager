import {DefaultAction} from '../../model/Action'
import fs from 'fs'
import path from 'path'
import {missionContext} from '../../context/MissionContext'
import {RESULTS_UNPACK_DIR} from '../../context/context-variable-provider'

export function runUnpackAction(unpackAction: DefaultAction): void {
    unpackAction.produces?.forEach((filePath, fileName) => {
        const fullPath = path.resolve(<string>missionContext.getVariable(RESULTS_UNPACK_DIR), fileName)
        if (!fs.existsSync(fullPath)) {
            console.warn(`The file ${fileName} is absent from the results archive.`)
        }
    })
}