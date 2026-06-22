/* eslint-disable no-eval */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { PROJECT_SETTINGS_BY_LOCALE as PART1_PS, SMALL_LOCALE_STRINGS as PART1_SMALL } from './projectSettingsTranslations-part1.mjs'
import { PROJECT_SETTINGS_BY_LOCALE as PART2_PS, SMALL_LOCALE_STRINGS as PART2_SMALL } from './projectSettingsTranslations-part2.mjs'
import { PROJECT_SETTINGS_BY_LOCALE as PART3_PS, SMALL_LOCALE_STRINGS as PART3_SMALL } from './projectSettingsTranslations-part3.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(__dirname, '../..')
const LOCALES = ['ar', 'de', 'el', 'es', 'fi', 'fr', 'hi', 'it', 'ja', 'nb', 'pt', 'ru', 'sv', 'uk', 'zh']

const PROJECT_SETTINGS_BY_LOCALE = {
  ...PART1_PS,
  ...PART2_PS,
  ...PART3_PS
}

const SMALL_LOCALE_STRINGS = {
  ...PART1_SMALL,
  ...PART2_SMALL,
  ...PART3_SMALL
}

function loadEnProjectSettings () {
  const enPath = path.join(REPO_ROOT, 'i18n/en-US/dialogs/L_projectSettings.ts')
  const enSource = readFileSync(enPath, 'utf8')
  return eval(`(${enSource.replace(/^export default\s*/, '')})`)
}

function setByPath (obj, keyPath, value) {
  const keys = keyPath.split('.')
  let current = obj
  for (let index = 0; index < keys.length - 1; index += 1) {
    const key = keys[index]
    if (current[key] === undefined || current[key] === null) {
      current[key] = {}
    }
    current = current[key]
  }
  current[keys[keys.length - 1]] = value
}

function cloneWithFlatTranslations (base, flatTranslations) {
  const result = structuredClone(base)
  for (const [keyPath, value] of Object.entries(flatTranslations)) {
    setByPath(result, keyPath, value)
  }
  return result
}

function serializeTsValue (value, indentLevel) {
  const indent = '  '.repeat(indentLevel)
  if (typeof value === 'string') {
    return JSON.stringify(value)
  }
  const childIndent = '  '.repeat(indentLevel + 1)
  const lines = Object.entries(value).map(([key, childValue]) => {
    const safeKey = /^[A-Za-z_$][\w$]*$/.test(key) ? key : JSON.stringify(key)
    return `${childIndent}${safeKey}: ${serializeTsValue(childValue, indentLevel + 1)}`
  })
  return `{\n${lines.join(',\n')}\n${indent}}`
}

function writeTsModule (filePath, exportObject) {
  mkdirSync(path.dirname(filePath), { recursive: true })
  const body = serializeTsValue(exportObject, 0)
  writeFileSync(filePath, `export default ${body}\n`, 'utf8')
}

function patchIndexTs (locale) {
  const indexPath = path.join(REPO_ROOT, `i18n/${locale}/index.ts`)
  let source = readFileSync(indexPath, 'utf8')
  if (source.includes('L_projectSettings')) {
    return
  }

  source = source.replace(
    "import L_FantasiaMascotImage from './components/elements/FantasiaMascotImage/L_FantasiaMascotImage'",
    "import L_FantasiaMascotImage from './components/elements/FantasiaMascotImage/L_FantasiaMascotImage'\nimport L_FaColorPickerInput from './components/elements/FaColorPickerInput/L_FaColorPickerInput'\nimport L_FaIconPickerInput from './components/elements/FaIconPickerInput/L_FaIconPickerInput'"
  )

  source = source.replace(
    "import L_appSettings from './dialogs/L_appSettings'",
    "import L_appSettings from './dialogs/L_appSettings'\nimport L_projectSettings from './dialogs/L_projectSettings'"
  )

  source = source.replace(
    "import L_faUserSettings from './globalFunctionality/L_faUserSettings'",
    "import L_faUserSettings from './globalFunctionality/L_faUserSettings'\nimport L_faProjectSettings from './globalFunctionality/L_faProjectSettings'"
  )

  source = source.replace(
    "import L_ErrorNotFound from './pages/L_ErrorNotFound'",
    "import L_ErrorNotFound from './pages/L_ErrorNotFound'\nimport L_projectOverview from './components/projectUI/ProjectOverview/L_projectOverview'"
  )

  source = source.replace(
    '    appSettings: L_appSettings\n  },',
    '    appSettings: L_appSettings,\n    projectSettings: L_projectSettings\n  },'
  )

  source = source.replace(
    '  fantasiaMascotImage: L_FantasiaMascotImage,\n\n  // GLOBAL FUNCTIONALITY',
    '  fantasiaMascotImage: L_FantasiaMascotImage,\n\n  // COMPONENT - FA COLOR PICKER INPUT\n  faColorPickerInput: L_FaColorPickerInput,\n\n  // COMPONENT - FA ICON PICKER INPUT\n  faIconPickerInput: L_FaIconPickerInput,\n\n  // COMPONENT - PROJECT UI\n  projectUI: {\n    projectOverview: L_projectOverview\n  },\n\n  // GLOBAL FUNCTIONALITY'
  )

  source = source.replace(
    '    faProjectSession: L_faProjectSession,\n    faUserSettings: L_faUserSettings,',
    '    faProjectSession: L_faProjectSession,\n    faProjectSettings: L_faProjectSettings,\n    faUserSettings: L_faUserSettings,'
  )

  writeFileSync(indexPath, source, 'utf8')
}

function patchAppSettings (locale, logFullActivityPayload) {
  const filePath = path.join(REPO_ROOT, `i18n/${locale}/dialogs/L_appSettings.ts`)
  let source = readFileSync(filePath, 'utf8')
  if (source.includes('logFullActivityPayload')) {
    return
  }

  const block = `    logFullActivityPayload: {
      title: ${JSON.stringify(logFullActivityPayload.title)},
      description: ${JSON.stringify(logFullActivityPayload.description)},
      tags: ${JSON.stringify(logFullActivityPayload.tags)},
    },
`

  source = source.replace('    noProjectName: {', `${block}    noProjectName: {`)
  writeFileSync(filePath, source, 'utf8')
}

function patchFaActionManager (locale, labels) {
  const filePath = path.join(REPO_ROOT, `i18n/${locale}/globalFunctionality/L_faActionManager.ts`)
  let source = readFileSync(filePath, 'utf8')
  if (source.includes('openProjectSettingsDialog')) {
    return
  }

  const insertion = `    openProjectSettingsDialog: ${JSON.stringify(labels.openProjectSettingsDialog)},\n    saveProjectSettings: ${JSON.stringify(labels.saveProjectSettings)},\n`

  source = source.replace('    openLicenseDialog:', `${insertion}    openLicenseDialog:`)
  writeFileSync(filePath, source, 'utf8')
}

function patchSocialContactButtons (locale, redditLabel) {
  const filePath = path.join(REPO_ROOT, `i18n/${locale}/components/other/SocialContactButtons/L_socialContactButtons.ts`)
  let source = readFileSync(filePath, 'utf8')
  source = source.replace(
    /buttonReddit:\s*\{\s*\n\s*label:\s*''/,
    `buttonReddit: {\n    label: ${JSON.stringify(redditLabel)}`
  )
  writeFileSync(filePath, source, 'utf8')
}

const enProjectSettings = loadEnProjectSettings()

for (const locale of LOCALES) {
  const projectSettingsFlat = PROJECT_SETTINGS_BY_LOCALE[locale]
  const small = SMALL_LOCALE_STRINGS[locale]
  if (!projectSettingsFlat || !small) {
    throw new Error(`Missing translation bundle for locale: ${locale}`)
  }

  const projectSettings = cloneWithFlatTranslations(enProjectSettings, projectSettingsFlat)
  writeTsModule(path.join(REPO_ROOT, `i18n/${locale}/dialogs/L_projectSettings.ts`), projectSettings)

  writeTsModule(path.join(REPO_ROOT, `i18n/${locale}/globalFunctionality/L_faProjectSettings.ts`), small.faProjectSettings)
  writeTsModule(path.join(REPO_ROOT, `i18n/${locale}/components/elements/FaColorPickerInput/L_FaColorPickerInput.ts`), small.faColorPickerInput)
  writeTsModule(path.join(REPO_ROOT, `i18n/${locale}/components/elements/FaIconPickerInput/L_FaIconPickerInput.ts`), small.faIconPickerInput)
  writeTsModule(path.join(REPO_ROOT, `i18n/${locale}/components/projectUI/ProjectOverview/L_projectOverview.ts`), small.projectOverview)

  patchIndexTs(locale)
  patchAppSettings(locale, small.logFullActivityPayload)
  patchFaActionManager(locale, small.faActionManager.labels)
  patchSocialContactButtons(locale, small.socialContactButtons.buttonReddit.label)
}

console.log(`Applied missing i18n strings for locales: ${LOCALES.join(', ')}`)
