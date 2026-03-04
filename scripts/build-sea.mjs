import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { spawnSync } from 'node:child_process'

const rootDir = resolve(process.cwd())
const bundlePath = resolve(rootDir, 'dist/sea/voyager.bundle.cjs')
const outputDir = resolve(rootDir, 'dist/sea')

const platformName = getPlatformName(process.platform)
const extension = process.platform === 'win32' ? '.exe' : ''
const outputPath = resolve(outputDir, `dx-voyager-${platformName}-${process.arch}${extension}`)
const seaConfigPath = resolve(outputDir, 'sea-config.json')

mkdirSync(outputDir, { recursive: true })

const seaConfig = {
    main: bundlePath,
    mainFormat: 'commonjs',
    output: outputPath,
    disableExperimentalSEAWarning: true,
    useSnapshot: false,
    useCodeCache: false,
}

writeFileSync(seaConfigPath, `${JSON.stringify(seaConfig, null, 2)}\n`, 'utf8')

const seaResult = spawnSync(process.execPath, ['--build-sea', seaConfigPath], {
    cwd: rootDir,
    stdio: 'inherit',
})

if (seaResult.status !== 0)
    process.exit(seaResult.status ?? 1)

console.log(`SEA executable created at ${outputPath}`)
console.log(`SEA configuration saved at ${seaConfigPath}`)

function getPlatformName(platform) {
    if (platform === 'win32')
        return 'win'

    if (platform === 'darwin')
        return 'macos'

    if (platform === 'linux')
        return 'linux'

    throw new Error(`Unsupported platform '${platform}' for SEA output naming`)
}
