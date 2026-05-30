import type {
  T_importExportStepperPanel,
  T_importExportView
} from 'app/types/I_dialogImportExportAppConfig'

export function importExportViewToStepperPanel (v: T_importExportView): T_importExportStepperPanel {
  if (v === 'importSelect') {
    return 'import'
  }
  if (v === 'export') {
    return 'export'
  }
  return 'root'
}
