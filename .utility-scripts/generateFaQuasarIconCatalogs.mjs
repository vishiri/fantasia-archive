/**
 * Generates committed q-icon name catalogs from @quasar/extras and Material ligature source.
 *
 * Run: node .utility-scripts/generateFaQuasarIconCatalogs.mjs
 * Or:  yarn generate:icon-catalogs
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'

const ROOT = process.cwd()
const EXTRAS_ROOT = join(ROOT, 'node_modules', '@quasar', 'extras')
const OUTPUT_DIR = join(ROOT, 'src', 'scripts', 'faIcons', 'catalogs')
const MATERIAL_LIGATURE_SOURCE = join(
  ROOT,
  'src',
  'scripts',
  'faIcons',
  '_data',
  'material-icons-ligatures.source.json'
)

const MATERIAL_ICONS_JS_URL =
  'https://raw.githubusercontent.com/quasarframework/quasar-ui-qiconpicker/main/ui/src/components/icon-set/material-icons.js'

function camelCaseToKebab (segment) {
  return segment
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
    .toLowerCase()
}

function mdiExportKeyToQIconName (exportKey) {
  if (!exportKey.startsWith('mdi')) {
    return exportKey
  }

  const withoutPrefix = exportKey.slice(3)
  if (withoutPrefix.length === 0) {
    return 'mdi'
  }

  return `mdi-${camelCaseToKebab(withoutPrefix)}`
}

function fa6ExportKeyToQIconName (exportKey) {
  if (exportKey.startsWith('fab')) {
    return `fa-brands fa-${camelCaseToKebab(exportKey.slice(3))}`
  }

  if (exportKey.startsWith('fas')) {
    return `fa-solid fa-${camelCaseToKebab(exportKey.slice(3))}`
  }

  if (exportKey.startsWith('far')) {
    return `fa-regular fa-${camelCaseToKebab(exportKey.slice(3))}`
  }

  return exportKey
}

function readExtrasIconKeys (packFolder) {
  const iconsPath = join(EXTRAS_ROOT, packFolder, 'icons.json')
  const raw = readFileSync(iconsPath, 'utf8')
  const parsed = JSON.parse(raw)

  if (!Array.isArray(parsed)) {
    throw new Error(`Expected array in ${iconsPath}`)
  }

  return parsed
}

function writeCatalog (filename, names) {
  const sorted = [...names].sort((left, right) => left.localeCompare(right))
  const outputPath = join(OUTPUT_DIR, filename)
  writeFileSync(outputPath, `${JSON.stringify(sorted, null, 2)}\n`, 'utf8')
  console.log(`Wrote ${sorted.length} icons to ${outputPath}`)
}

function readMaterialLigatureSource () {
  const raw = readFileSync(MATERIAL_LIGATURE_SOURCE, 'utf8')
  const parsed = JSON.parse(raw)

  if (!Array.isArray(parsed)) {
    throw new Error('material-icons-ligatures.source.json must be a string array')
  }

  return parsed
}

async function fetchAndSaveMaterialLigatureSource () {
  const response = await fetch(MATERIAL_ICONS_JS_URL)

  if (!response.ok) {
    throw new Error(`Failed to fetch Material ligature source: ${response.status}`)
  }

  const body = await response.text()
  const names = []
  const nameRe = /\{\s*name:\s*'([^']+)'/g
  let match = nameRe.exec(body)

  while (match !== null) {
    names.push(match[1])
    match = nameRe.exec(body)
  }

  if (names.length === 0) {
    throw new Error('No Material icon ligature names parsed from upstream source')
  }

  mkdirSync(dirname(MATERIAL_LIGATURE_SOURCE), { recursive: true })
  writeFileSync(
    MATERIAL_LIGATURE_SOURCE,
    `${JSON.stringify(names, null, 2)}\n`,
    'utf8'
  )
  console.log(`Wrote ${names.length} ligatures to ${MATERIAL_LIGATURE_SOURCE}`)

  return names
}

async function resolveMaterialLigatures () {
  try {
    return readMaterialLigatureSource()
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
      return fetchAndSaveMaterialLigatureSource()
    }

    throw error
  }
}

async function main () {
  mkdirSync(OUTPUT_DIR, { recursive: true })

  const mdiKeys = readExtrasIconKeys('mdi-v7')
  writeCatalog(
    'mdi-v7.catalog.json',
    mdiKeys.map(mdiExportKeyToQIconName)
  )

  const faKeys = readExtrasIconKeys('fontawesome-v6')
  writeCatalog(
    'fontawesome-v6.catalog.json',
    faKeys.map(fa6ExportKeyToQIconName)
  )

  const materialLigatures = await resolveMaterialLigatures()
  writeCatalog('material-icons.catalog.json', materialLigatures)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
