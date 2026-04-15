const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

const AdmZip = require('adm-zip')
const yaml = require('js-yaml')

const v1ZipPath = process.argv[2]
const v2ZipPath = process.argv[3]
const instrumentsDir = process.argv[4]
const reportPath = process.argv[5]

if (!v1ZipPath || !v2ZipPath || !instrumentsDir || !reportPath) {
    throw new Error('Usage: node compare-results.js <v1-zip> <v2-zip> <instruments-dir> <report-path>')
}

function sha256(buffer) {
    return crypto.createHash('sha256').update(buffer).digest('hex')
}

function normalizeJson(value) {
    if (Array.isArray(value)) {
        const normalizedArray = value.map(normalizeJson)
        return normalizedArray.sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)))
    }

    if (value !== null && typeof value === 'object') {
        const sortedKeys = Object.keys(value).sort()
        const normalizedObject = {}
        for (const key of sortedKeys) {
            normalizedObject[key] = normalizeJson(value[key])
        }
        return normalizedObject
    }

    return value
}

function hashInstrumentFile(relativePath, contentBuffer) {
    if (relativePath === 'results/test-repos-raw.json') {
        const parsed = JSON.parse(contentBuffer.toString('utf8'))
        const normalized = normalizeJson(parsed)
        return sha256(Buffer.from(JSON.stringify(normalized)))
    }

    return sha256(contentBuffer)
}

function getInstrumentMappings(baseDir) {
    const dirs = fs.readdirSync(baseDir, { withFileTypes: true }).filter(d => d.isDirectory())
    const missing = []
    const mappings = []

    for (const dir of dirs) {
        const current = path.join(baseDir, dir.name)
        const v1Manifest = path.join(current, 'instrument.yml')
        const v2Manifest = path.join(current, 'instrument.v2.yml')
        if (!fs.existsSync(v1Manifest) || !fs.existsSync(v2Manifest)) {
            missing.push(dir.name)
            continue
        }

        const v1Config = yaml.load(fs.readFileSync(v1Manifest, 'utf8')) || {}
        const v2Config = yaml.load(fs.readFileSync(v2Manifest, 'utf8')) || {}

        const v1Name = String(v1Config.name || '').trim()
        const v2Key = String(v2Config.id || v2Config.name || '').trim()

        if (!v1Name || !v2Key)
            throw new Error(`Missing instrument name in ${dir.name}`)

        mappings.push({
            folder: dir.name,
            v1Key: v1Name,
            v2Key: v2Key,
        })
    }

    if (missing.length > 0)
        throw new Error(`Missing dual manifests for: ${missing.join(', ')}`)

    return mappings
}

function buildManifestForInstrument(zip, instrumentKey) {
    const entries = zip.getEntries()
    const manifest = new Map()
    const prefix = `${instrumentKey}/`
    const resultsPrefix = 'results/'

    for (const entry of entries) {
        if (entry.isDirectory) continue
        const name = entry.entryName.replace(/\\/g, '/')
        if (!name.startsWith(prefix)) continue
        const relativePath = name.slice(prefix.length)
        if (!relativePath) continue
        if (!relativePath.startsWith(resultsPrefix)) continue
        if (relativePath === 'results/targets.jsonl') continue
        if (relativePath === 'results/logs.txt') continue
        if (relativePath === 'results/missing_files_logs.txt') continue

        const content = entry.getData()
        manifest.set(relativePath, hashInstrumentFile(relativePath, content))
    }

    return manifest
}

function compareSubset(v1Manifest, v2Manifest) {
    const missingInB = []
    const hashMismatch = []

    for (const [file, hash] of v1Manifest.entries()) {
        if (!v2Manifest.has(file)) {
            missingInB.push(file)
            continue
        }
        if (v2Manifest.get(file) !== hash)
            hashMismatch.push(file)
    }

    return { missingInB, hashMismatch }
}

const instrumentMappings = getInstrumentMappings(instrumentsDir)
if (instrumentMappings.length === 0)
    throw new Error('No instruments found to compare')

const v1Zip = new AdmZip(v1ZipPath)
const v2Zip = new AdmZip(v2ZipPath)

const missingInV2 = []
const hashMismatches = []
const perInstrumentStats = []

for (const mapping of instrumentMappings) {
    const v1Manifest = buildManifestForInstrument(v1Zip, mapping.v1Key)
    const v2Manifest = buildManifestForInstrument(v2Zip, mapping.v2Key)
    const diff = compareSubset(v1Manifest, v2Manifest)

    perInstrumentStats.push(
        `${mapping.folder}: v1='${mapping.v1Key}' files=${v1Manifest.size}, v2='${mapping.v2Key}' files=${v2Manifest.size}`
    )

    for (const file of diff.missingInB)
        missingInV2.push(`${mapping.v1Key}/${file} (expected in v2 under ${mapping.v2Key}/${file})`)

    for (const file of diff.hashMismatch)
        hashMismatches.push(`${mapping.v1Key}/${file} (v2: ${mapping.v2Key}/${file})`)
}

const reportLines = [
    `Instrument count: ${instrumentMappings.length}`,
    `Missing in V2: ${missingInV2.length}`,
    `Hash mismatches: ${hashMismatches.length}`,
    '',
    'Per instrument coverage:',
    ...perInstrumentStats.sort(),
]

if (missingInV2.length > 0)
    reportLines.push('', 'Files missing in V2:', ...missingInV2.sort())

if (hashMismatches.length > 0)
    reportLines.push('', 'Files with different content:', ...hashMismatches.sort())

fs.writeFileSync(reportPath, reportLines.join('\n'))
console.log(reportLines.join('\n'))

if (missingInV2.length > 0 || hashMismatches.length > 0)
    process.exit(1)
