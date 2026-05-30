/**
 * Path helpers for fa-two-level ESLint rules (POSIX-style slashes).
 */

export function normalizeFaTwoLevelPath (filePath) {
  return filePath.replace(/\\/g, '/')
}

export function isFaTwoLevelFunctionsFile (normalizedPath) {
  return /\/functions\/[^/]+\.ts$/.test(normalizedPath)
}

export function isFaTwoLevelManagerFile (normalizedPath) {
  return /_manager\.ts$/.test(normalizedPath)
}

export function isFaTwoLevelPiniaStoreManager (normalizedPath) {
  return /\/src\/stores\/S_[^/]+\.ts$/.test(normalizedPath)
}

export function isFaTwoLevelTypesImportSource (importSource) {
  if (importSource === undefined || importSource === '') {
    return false
  }

  const normalized = importSource.replace(/\\/g, '/')

  if (normalized.startsWith('app/types/')) {
    return true
  }

  if (normalized.startsWith('types/')) {
    return true
  }

  return /^(\.\.\/)+types\//.test(normalized) ||
    /^(\.\.\/)+types$/.test(normalized)
}

export function isFaTwoLevelAllowedVueImportSource (importSource) {
  if (importSource === undefined) {
    return false
  }

  const normalized = importSource.replace(/\\/g, '/')

  if (isFaTwoLevelTypesImportSource(normalized)) {
    return true
  }

  if (normalized.startsWith('.')) {
    if (normalized.endsWith('.vue')) {
      return true
    }

    if (normalized.includes('_manager')) {
      return true
    }
  }

  return false
}

export function getFaTwoLevelMainScriptsAreaFromFile (normalizedPath) {
  const areaMatch = normalizedPath.match(/^(src-electron\/mainScripts\/[^/]+)\//)

  if (areaMatch !== null) {
    return areaMatch[1]
  }

  return null
}

export function isFaTwoLevelAllowedMainScriptsSiblingFile (normalizedPath, areaDir) {
  if (!normalizedPath.startsWith(`${areaDir}/`) || !normalizedPath.endsWith('.ts')) {
    return false
  }

  const baseName = normalizedPath.slice(areaDir.length + 1)

  if (baseName.includes('/')) {
    if (baseName.startsWith('_tests/') || baseName.startsWith('functions/')) {
      return true
    }

    return false
  }

  if (isFaTwoLevelManagerFile(normalizedPath)) {
    return true
  }

  if (/_managerDefaults\.ts$/.test(baseName)) {
    return true
  }

  if (/(Wiring|Surface|Session|Runtime|Api|Bound)\.ts$/.test(baseName)) {
    return true
  }

  if (areaDir === 'src-electron/mainScripts/ipcManagement') {
    if (/^registerFa[A-Za-z]+\.ts$/.test(baseName)) {
      return true
    }

    if (baseName === 'revealElectronDevToolsConsoleBestEffort.ts') {
      return true
    }
  }

  if (areaDir === 'src-electron/mainScripts/appProtocol') {
    if (/^registerFaAppProtocolWiring\.ts$/.test(baseName)) {
      return true
    }
  }

  return false
}

export function getFaTwoLevelScriptsDirFromFile (normalizedPath) {
  const scriptsMatch = normalizedPath.match(/^(.*\/scripts)\//)

  if (scriptsMatch !== null) {
    return scriptsMatch[1]
  }

  const domainMatch = normalizedPath.match(/^(src\/scripts\/[^/]+)\//)

  if (domainMatch !== null) {
    return domainMatch[1]
  }

  const mainScriptsArea = getFaTwoLevelMainScriptsAreaFromFile(normalizedPath)

  if (mainScriptsArea !== null) {
    return mainScriptsArea
  }

  return null
}

export function getFaTwoLevelFeatureRootFromVue (normalizedPath) {
  const match = normalizedPath.match(/^(src\/(?:components|layouts|pages)\/[^/]+\/[^/]+)\//)

  if (match !== null) {
    return match[1]
  }

  if (normalizedPath === 'src/App.vue') {
    return 'src'
  }

  return null
}

export function isFaTwoLevelExcludedLintPath (normalizedPath) {
  if (normalizedPath.includes('/node_modules/')) {
    return true
  }

  if (/\.vitest\.test\.ts$/.test(normalizedPath)) {
    return true
  }

  if (/\.stories\.ts$/.test(normalizedPath)) {
    return true
  }

  if (/playwright/i.test(normalizedPath)) {
    return true
  }

  if (normalizedPath.startsWith('e2e-tests/')) {
    return true
  }

  if (normalizedPath.startsWith('helpers/playwrightHelpers_')) {
    return true
  }

  if (normalizedPath.startsWith('i18n/')) {
    return true
  }

  if (normalizedPath.startsWith('types/')) {
    return true
  }

  if (normalizedPath.startsWith('vitest/')) {
    return true
  }

  if (normalizedPath.startsWith('.storybook-workspace/')) {
    return true
  }

  return false
}

export function isFaTwoLevelStoreBridgeScript (normalizedPath) {
  return /\/src\/stores\/scripts\/[^/]*Bridge[^/]*\.ts$/.test(normalizedPath)
}
