import type { I_faAppConfigImportPartsUi } from 'app/types/I_faAppConfigDomain'
import type { Ref } from 'app/types/I_vueCompositionRefs'

export type T_importExportView = 'export' | 'importSelect' | 'root'

/** QStepper panel id derived from import/export dialog view state. */
export type T_importExportStepperPanel = 'export' | 'import' | 'root'

export interface I_importExportDialogActionBindings {
  exportIncludeKeybinds: Ref<boolean>
  exportIncludeAppNoteboard: Ref<boolean>
  exportIncludeAppSettings: Ref<boolean>
  exportIncludeAppStyling: Ref<boolean>
  importApplyKeybinds: Ref<boolean>
  importApplyAppNoteboard: Ref<boolean>
  importApplyAppSettings: Ref<boolean>
  importApplyAppStyling: Ref<boolean>
  importSessionId: Ref<string>
  importParts: Ref<I_faAppConfigImportPartsUi | null>
  onRequestClose: () => void
  view: Ref<T_importExportView>
}
