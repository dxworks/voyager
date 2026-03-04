import fs from 'fs'
import os from 'node:os'
import path from 'node:path'
import yaml from 'js-yaml'

export function makeTempDir(prefix: string): string {
    return fs.mkdtempSync(path.join(os.tmpdir(), `${prefix}-`))
}

export function writeYaml(filePath: string, content: unknown): void {
    fs.writeFileSync(filePath, yaml.dump(content))
}

export function cleanupTempDir(dirPath: string): void {
    if (fs.existsSync(dirPath))
        fs.rmSync(dirPath, {recursive: true, force: true})
}
