import type { I_faAppConfigImportPartsUi } from 'app/types/I_faAppConfigDomain'

export function isImportExportCreateExportDisabled (flags: {
  includeKeybinds: boolean
  includeAppNoteboard: boolean
  includeAppSettings: boolean
  includeAppStyling: boolean
}): boolean {
  return (
    !flags.includeKeybinds &&
    !flags.includeAppNoteboard &&
    !flags.includeAppSettings &&
    !flags.includeAppStyling
  )
}

export function isImportExportPartAvailable (
  partStatus: I_faAppConfigImportPartsUi[keyof I_faAppConfigImportPartsUi] | undefined
): boolean {
  return partStatus === 'ok'
}

export function isImportExportApplyDisabled (params: {
  importParts: I_faAppConfigImportPartsUi | null
  applyKeybinds: boolean
  applyAppNoteboard: boolean
  applyAppSettings: boolean
  applyAppStyling: boolean
}): boolean {
  if (params.importParts === null) {
    return true
  }
  const parts = params.importParts
  const anySelected =
    (isImportExportPartAvailable(parts.appSettings) && params.applyAppSettings) ||
    (isImportExportPartAvailable(parts.keybinds) && params.applyKeybinds) ||
    (isImportExportPartAvailable(parts.appNoteboard) && params.applyAppNoteboard) ||
    (isImportExportPartAvailable(parts.appStyling) && params.applyAppStyling)
  return !anySelected
}
