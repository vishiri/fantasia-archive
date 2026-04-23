import { Notify } from 'quasar'
import type { Ref } from 'vue'

import { i18n } from 'app/i18n/externalFileLoader'
import type { I_faProgramConfigImportPartsUi } from 'app/types/I_faProgramConfigDomain'
import { runFaAction, runFaActionAwait } from 'app/src/scripts/actionManager/faActionManagerRun'

import type { T_importExportView } from './dialogImportExportProgramConfigDialogModel'

export interface I_importExportDialogActionBindings {
  exportIncludeKeybinds: Ref<boolean>
  exportIncludeProgramSettings: Ref<boolean>
  exportIncludeProgramStyling: Ref<boolean>
  importApplyKeybinds: Ref<boolean>
  importApplyProgramSettings: Ref<boolean>
  importApplyProgramStyling: Ref<boolean>
  importSessionId: Ref<string>
  importParts: Ref<I_faProgramConfigImportPartsUi | null>
  onRequestClose: () => void
  view: Ref<T_importExportView>
}

export async function importExportDialogClickCreateExport (b: I_importExportDialogActionBindings): Promise<void> {
  const inc = {
    includeKeybinds: b.exportIncludeKeybinds.value,
    includeProgramSettings: b.exportIncludeProgramSettings.value,
    includeProgramStyling: b.exportIncludeProgramStyling.value
  }
  runFaAction('exportProgramConfigPackage', inc)
  const api = window.faContentBridgeAPIs?.faProgramConfig
  if (api === undefined) {
    return
  }
  const r = await api.exportToFile(inc)
  runFaAction('exportProgramConfigSaveResult', {
    errorMessage: r.errorMessage,
    errorName: r.errorName,
    filePath: r.filePath,
    status: r.outcome === 'saved' ? 'saved' : r.outcome === 'canceled' ? 'canceled' : 'error'
  })
  if (r.outcome === 'saved') {
    Notify.create({
      group: false,
      message: i18n.global.t('dialogs.importExportProgramConfig.toasts.exportSuccess'),
      type: 'positive'
    })
    b.onRequestClose()
  }
}

export async function importExportDialogClickPrepareImport (b: I_importExportDialogActionBindings): Promise<void> {
  const api = window.faContentBridgeAPIs?.faProgramConfig
  if (api === undefined) {
    return
  }
  const r = await api.prepareImport()
  if (r.outcome === 'canceled') {
    void runFaAction('importProgramConfigStageResult', { status: 'canceled' })
    return
  }
  if (r.outcome === 'error' || r.sessionId === undefined || r.parts === undefined) {
    void runFaAction('importProgramConfigStageResult', {
      errorCode: r.errorName,
      errorMessage: r.errorMessage,
      status: 'fail'
    })
    return
  }
  void runFaAction('importProgramConfigStageResult', {
    sessionId: r.sessionId,
    status: 'pass'
  })
  b.importSessionId.value = r.sessionId
  b.importParts.value = r.parts
  b.view.value = 'importSelect'
}

export async function importExportDialogClickApplyImport (b: I_importExportDialogActionBindings): Promise<void> {
  const api = window.faContentBridgeAPIs?.faProgramConfig
  if (api === undefined || b.importSessionId.value === '') {
    return
  }
  const input = {
    applyKeybinds: b.importApplyKeybinds.value,
    applyProgramSettings: b.importApplyProgramSettings.value,
    applyProgramStyling: b.importApplyProgramStyling.value,
    sessionId: b.importSessionId.value
  }
  const ok = await runFaActionAwait('importProgramConfigApply', input)
  if (!ok) {
    return
  }
  Notify.create({
    group: false,
    message: i18n.global.t('dialogs.importExportProgramConfig.toasts.importSuccess'),
    type: 'positive'
  })
  b.onRequestClose()
}
