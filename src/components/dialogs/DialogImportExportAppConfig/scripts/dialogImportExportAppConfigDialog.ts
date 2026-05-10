import {
  importExportDialogClickApplyImport,
  importExportDialogClickCreateExport,
  importExportDialogClickPrepareImport
} from './dialogImportExportAppConfigDialogActions'
import { useImportExportAppConfigDialogModel } from './dialogImportExportAppConfigDialogModel'

export { type T_importExportView } from './dialogImportExportAppConfigDialogModel'

/**
 * Composes the Import / Export app configuration dialog state and action wiring.
 */
export function useDialogImportExportAppConfigDialog (opts: { onRequestClose: () => void }) {
  const m = useImportExportAppConfigDialogModel(opts)
  const bindings = {
    exportIncludeKeybinds: m.exportIncludeKeybinds,
    exportIncludeAppNoteboard: m.exportIncludeAppNoteboard,
    exportIncludeAppSettings: m.exportIncludeAppSettings,
    exportIncludeAppStyling: m.exportIncludeAppStyling,
    importApplyKeybinds: m.importApplyKeybinds,
    importApplyAppNoteboard: m.importApplyAppNoteboard,
    importApplyAppSettings: m.importApplyAppSettings,
    importApplyAppStyling: m.importApplyAppStyling,
    importParts: m.importParts,
    importSessionId: m.importSessionId,
    onRequestClose: m.onRequestClose,
    view: m.view
  }
  const createExportDisabledOut = m.createExportDisabled
  const dialogModelOut = m.dialogModel
  const exportIncludeKeybindsOut = m.exportIncludeKeybinds
  const exportIncludeAppNoteboardOut = m.exportIncludeAppNoteboard
  const exportIncludeAppSettingsOut = m.exportIncludeAppSettings
  const exportIncludeAppStylingOut = m.exportIncludeAppStyling
  const importApplyDisabledOut = m.importApplyDisabled
  const importApplyKeybindsOut = m.importApplyKeybinds
  const importApplyAppNoteboardOut = m.importApplyAppNoteboard
  const importApplyAppSettingsOut = m.importApplyAppSettings
  const importApplyAppStylingOut = m.importApplyAppStyling
  const importSessionIdOut = m.importSessionId
  const keybindsImportEnabledOut = m.keybindsImportEnabled
  const appNoteboardImportEnabledOut = m.appNoteboardImportEnabled
  const appSettingsImportEnabledOut = m.appSettingsImportEnabled
  const appStylingImportEnabledOut = m.appStylingImportEnabled
  const viewOut = m.view
  const onClickCreateExportOut = async (): Promise<void> => importExportDialogClickCreateExport(bindings)
  const onClickImportOut = async (): Promise<void> => importExportDialogClickPrepareImport(bindings)
  const onClickImportSelectedOut = async (): Promise<void> => importExportDialogClickApplyImport(bindings)

  return {
    createExportDisabled: createExportDisabledOut,
    dialogModel: dialogModelOut,
    exportIncludeKeybinds: exportIncludeKeybindsOut,
    exportIncludeAppNoteboard: exportIncludeAppNoteboardOut,
    exportIncludeAppSettings: exportIncludeAppSettingsOut,
    exportIncludeAppStyling: exportIncludeAppStylingOut,
    importApplyDisabled: importApplyDisabledOut,
    importApplyKeybinds: importApplyKeybindsOut,
    importApplyAppNoteboard: importApplyAppNoteboardOut,
    importApplyAppSettings: importApplyAppSettingsOut,
    importApplyAppStyling: importApplyAppStylingOut,
    importSessionId: importSessionIdOut,
    keybindsImportEnabled: keybindsImportEnabledOut,
    onClickCreateExport: onClickCreateExportOut,
    onClickImport: onClickImportOut,
    onClickImportSelected: onClickImportSelectedOut,
    appNoteboardImportEnabled: appNoteboardImportEnabledOut,
    appSettingsImportEnabled: appSettingsImportEnabledOut,
    appStylingImportEnabled: appStylingImportEnabledOut,
    view: viewOut
  }
}
