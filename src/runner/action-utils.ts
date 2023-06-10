import fs from 'fs'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const {minimatch} = require('minimatch')

export const cleanActionKey = 'clean'
export const packageActionKey = 'pack'
export const startActionKey = 'start'
export const verifyActionKey = 'verify'
export const unpackActionKey = 'unpack'

const defaultActionKeys: string[] = [cleanActionKey, packageActionKey, verifyActionKey, unpackActionKey]

export function isDefaultAction(actionKey: string): boolean {
    for (let i = 0; i < defaultActionKeys.length; i++)
        if (defaultActionKeys[i] === actionKey)
            return true

    return false
}

export function getMatchingFilesFromDir(sourcePath: string, matchingStrings: string[]): string[] {
    const matchingFiles: string[] = []
    if (fs.existsSync(sourcePath)) {
        const files = fs.readdirSync(sourcePath)
        matchingStrings.forEach(matchingString => {
            matchingFiles.push(...files.filter(file => {
                return minimatch(file, matchingString)
            }))
        })
    }
    return matchingFiles
}

