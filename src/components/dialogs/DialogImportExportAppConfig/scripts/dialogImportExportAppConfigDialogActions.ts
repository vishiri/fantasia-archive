import { Notify } from 'quasar'
import type { Ref } from 'vue'

import { i18n } from 'app/i18n/externalFileLoader'
import type { I_faAppConfigImportPartsUi } from 'app/types/I_faAppConfigDomain'
import { runFaAction, runFaActionAwait } from 'app/src/scripts/actionManager/faActionManagerRun'

import type { T_importExportView } from './dialogImportExportAppConfigDialogModel'

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

export async function importExportDialogClickCreateExport (b: I_importExportDialogActionBindings): Promise<void> {
  const inc = {
    includeKeybinds: b.exportIncludeKeybinds.value,
    includeAppNoteboard: b.exportIncludeAppNoteboard.value,
    includeAppSettings: b.exportIncludeAppSettings.value,
    includeAppStyling: b.exportIncludeAppStyling.value
  }
  const ok = await runFaActionAwait('exportAppConfigPackage', inc)
  if (!ok) {
    return
  }
  Notify.create({
    group: false,
    message: i18n.global.t('dialogs.importExportAppConfig.toasts.exportSuccess'),
    type: 'positive'
  })
  b.onRequestClose()
}

export async function importExportDialogClickPrepareImport (b: I_importExportDialogActionBindings): Promise<void> {
  const api = window.faContentBridgeAPIs?.faAppConfig
  if (api === undefined) {
    return
  }
  const r = await api.prepareImport()
  if (r.outcome === 'canceled') {
    void runFaAction('importAppConfigStageResult', { status: 'canceled' })
    return
  }
  if (r.outcome === 'error' || r.sessionId === undefined || r.parts === undefined) {
    void runFaAction('importAppConfigStageResult', {
      errorCode: r.errorName,
      errorMessage: r.errorMessage,
      status: 'fail'
    })
    return
  }
  void runFaAction('importAppConfigStageResult', {
    sessionId: r.sessionId,
    status: 'pass'
  })
  b.importSessionId.value = r.sessionId
  b.importParts.value = r.parts
  b.view.value = 'importSelect'
}

export async function importExportDialogClickApplyImport (b: I_importExportDialogActionBindings): Promise<void> {
  const api = window.faContentBridgeAPIs?.faAppConfig
  if (api === undefined || b.importSessionId.value === '') {
    return
  }
  const input = {
    applyKeybinds: b.importApplyKeybinds.value,
    applyAppNoteboard: b.importApplyAppNoteboard.value,
    applyAppSettings: b.importApplyAppSettings.value,
    applyAppStyling: b.importApplyAppStyling.value,
    sessionId: b.importSessionId.value
  }
  const ok = await runFaActionAwait('importAppConfigApply', input)
  if (!ok) {
    return
  }
  Notify.create({
    group: false,
    message: i18n.global.t('dialogs.importExportAppConfig.toasts.importSuccess'),
    type: 'positive'
  })
  b.onRequestClose()
}
