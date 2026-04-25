import {
  importExportDialogClickApplyImport,
  importExportDialogClickCreateExport,
  importExportDialogClickPrepareImport
} from './dialogImportExportProgramConfigDialogActions'
import { useImportExportProgramConfigDialogModel } from './dialogImportExportProgramConfigDialogModel'

export { type T_importExportView } from './dialogImportExportProgramConfigDialogModel'

/**
 * Composes the Import / Export program configuration dialog state and action wiring.
 */
export function useDialogImportExportProgramConfigDialog (opts: { onRequestClose: () => void }) {
  const m = useImportExportProgramConfigDialogModel(opts)
  const bindings = {
    exportIncludeKeybinds: m.exportIncludeKeybinds,
    exportIncludeProgramSettings: m.exportIncludeProgramSettings,
    exportIncludeProgramStyling: m.exportIncludeProgramStyling,
    importApplyKeybinds: m.importApplyKeybinds,
    importApplyProgramSettings: m.importApplyProgramSettings,
    importApplyProgramStyling: m.importApplyProgramStyling,
    importParts: m.importParts,
    importSessionId: m.importSessionId,
    onRequestClose: m.onRequestClose,
    view: m.view
  }
  return {
    createExportDisabled: m.createExportDisabled,
    dialogModel: m.dialogModel,
    exportIncludeKeybinds: m.exportIncludeKeybinds,
    exportIncludeProgramSettings: m.exportIncludeProgramSettings,
    exportIncludeProgramStyling: m.exportIncludeProgramStyling,
    importApplyDisabled: m.importApplyDisabled,
    importApplyKeybinds: m.importApplyKeybinds,
    importApplyProgramStyling: m.importApplyProgramStyling,
    importApplyProgramSettings: m.importApplyProgramSettings,
    importSessionId: m.importSessionId,
    keybindsImportEnabled: m.keybindsImportEnabled,
    onClickCreateExport: async () => importExportDialogClickCreateExport(bindings),
    onClickImport: async () => importExportDialogClickPrepareImport(bindings),
    onClickImportSelected: async () => importExportDialogClickApplyImport(bindings),
    programSettingsImportEnabled: m.programSettingsImportEnabled,
    programStylingImportEnabled: m.programStylingImportEnabled,
    view: m.view
  }
}
