import type { I_faActionPayloadMap } from 'app/types/I_faActionManagerDomain'
import type { I_createFaActionDefinitionHandlersDialogsDeps } from 'app/types/I_createFaActionDefinitionHandlersDialogsDeps'

export function buildFaActionDefinitionHandlersDialogsAppConfig (
  deps: I_createFaActionDefinitionHandlersDialogsDeps
): {
    handleExportAppConfigPackage: (payload: I_faActionPayloadMap['exportAppConfigPackage']) => Promise<void>
    handleExportAppConfigSaveResult: (payload: I_faActionPayloadMap['exportAppConfigSaveResult']) => Promise<void>
    handleImportAppConfigStageResult: (payload: I_faActionPayloadMap['importAppConfigStageResult']) => Promise<void>
    handleImportAppConfigApply: (payload: I_faActionPayloadMap['importAppConfigApply']) => Promise<void>
  } {
  async function handleExportAppConfigPackage (
    payload: I_faActionPayloadMap['exportAppConfigPackage']
  ): Promise<void> {
    const api = window.faContentBridgeAPIs?.faAppConfig
    if (api === undefined) {
      throw new Error(deps.i18n.global.t('dialogs.importExportAppConfig.errors.desktopOnly'))
    }
    const result = await api.exportToFile(payload)
    if (result.outcome === 'canceled') {
      void deps.runFaAction('exportAppConfigSaveResult', { status: 'canceled' })
      throw new deps.FaActionUserCanceledError()
    }
    if (result.outcome === 'error') {
      void deps.runFaAction('exportAppConfigSaveResult', {
        errorMessage: result.errorMessage,
        errorName: result.errorName,
        status: 'error'
      })
      throw new Error(result.errorMessage ?? result.errorName ?? deps.i18n.global.t('dialogs.importExportAppConfig.errors.exportToFileFailed'))
    }
    void deps.runFaAction('exportAppConfigSaveResult', {
      filePath: result.filePath,
      status: 'saved'
    })
  }

  async function handleExportAppConfigSaveResult (
    payload: I_faActionPayloadMap['exportAppConfigSaveResult']
  ): Promise<void> {
    if (payload.status === 'error') {
      throw new Error(payload.errorMessage ?? payload.errorName ?? deps.i18n.global.t('dialogs.importExportAppConfig.errors.exportToFileFailed'))
    }
  }

  async function handleImportAppConfigStageResult (
    payload: I_faActionPayloadMap['importAppConfigStageResult']
  ): Promise<void> {
    if (payload.status === 'fail') {
      throw new Error(payload.errorMessage ?? deps.i18n.global.t('dialogs.importExportAppConfig.errors.importValidationFailed'))
    }
  }

  async function handleImportAppConfigApply (
    payload: I_faActionPayloadMap['importAppConfigApply']
  ): Promise<void> {
    const api = window.faContentBridgeAPIs?.faAppConfig
    if (api === undefined) {
      throw new Error(deps.i18n.global.t('dialogs.importExportAppConfig.errors.desktopOnly'))
    }
    await api.applyImport(payload)
    await Promise.all([
      deps.S_FaKeybinds().refreshKeybinds(),
      deps.S_FaAppNoteboard().refreshNoteboard(),
      deps.S_FaProjectNoteboard().refreshProjectNoteboard(),
      deps.S_FaProjectStyling().refreshProjectStyling(),
      deps.S_FaAppStyling().refreshAppStyling(),
      deps.S_FaUserSettings().refreshSettings()
    ])
  }

  return {
    handleExportAppConfigPackage,
    handleExportAppConfigSaveResult,
    handleImportAppConfigStageResult,
    handleImportAppConfigApply
  }
}
