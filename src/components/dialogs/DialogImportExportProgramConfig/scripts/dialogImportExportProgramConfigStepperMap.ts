import type { T_importExportView } from './dialogImportExportProgramConfigDialogModel'

export type T_importExportStepperPanel = 'export' | 'import' | 'root'

export function importExportViewToStepperPanel (v: T_importExportView): T_importExportStepperPanel {
  if (v === 'importSelect') {
    return 'import'
  }
  if (v === 'export') {
    return 'export'
  }
  return 'root'
}
