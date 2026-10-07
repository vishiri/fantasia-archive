/* eslint-disable max-lines, max-lines-per-function -- monolithic create factory; decompose when extracting concerns */
import type { I_faAppConfigImportPartsUi } from 'app/types/I_faAppConfigDomain'
import type { I_faActionPayloadMap, T_faActionId } from 'app/types/I_faActionManagerDomain'
import type { I_dialogComponentStoreLike } from 'app/types/I_dialogComponentStoreLike'
import type { T_dialogName } from 'app/types/T_appDialogsAndDocuments'
import type { ComputedRef, Ref } from 'app/types/I_vueCompositionRefs'

import type {
  I_importExportDialogActionBindings,
  T_importExportView
} from 'app/types/I_dialogImportExportAppConfig'

function readImportExportIncludeFlags (b: I_importExportDialogActionBindings): {
  includeAppNoteboard: boolean
  includeAppSettings: boolean
  includeAppStyling: boolean
  includeKeybinds: boolean
} {
  const includeAppNoteboard = b.exportIncludeAppNoteboard.value
  const includeAppSettings = b.exportIncludeAppSettings.value
  const includeAppStyling = b.exportIncludeAppStyling.value
  const includeKeybinds = b.exportIncludeKeybinds.value
  return {
    includeAppNoteboard,
    includeAppSettings,
    includeAppStyling,
    includeKeybinds
  }
}

function readImportExportApplyInput (b: I_importExportDialogActionBindings): {
  applyAppNoteboard: boolean
  applyAppSettings: boolean
  applyAppStyling: boolean
  applyKeybinds: boolean
  sessionId: string
} {
  const applyAppNoteboard = b.importApplyAppNoteboard.value
  const applyAppSettings = b.importApplyAppSettings.value
  const applyAppStyling = b.importApplyAppStyling.value
  const applyKeybinds = b.importApplyKeybinds.value
  const sessionId = b.importSessionId.value
  return {
    applyAppNoteboard,
    applyAppSettings,
    applyAppStyling,
    applyKeybinds,
    sessionId
  }
}

function importExportSnapshotsMatch (left: unknown, right: unknown): boolean {
  return JSON.stringify(left) === JSON.stringify(right)
}

export function createDialogImportExportAppConfig (deps: {
  S_DialogComponent: () => I_dialogComponentStoreLike
  Notify: { create: (opts: Record<string, unknown>) => void }
  computed: <T>(getter: () => T) => ComputedRef<T>
  i18n: { global: { t: (key: string) => string } }
  isImportExportApplyDisabled: (params: {
    importParts: I_faAppConfigImportPartsUi | null
    applyKeybinds: boolean
    applyAppNoteboard: boolean
    applyAppSettings: boolean
    applyAppStyling: boolean
  }) => boolean
  isImportExportCreateExportDisabled: (flags: {
    includeKeybinds: boolean
    includeAppNoteboard: boolean
    includeAppSettings: boolean
    includeAppStyling: boolean
  }) => boolean
  isImportExportPartAvailable: (
    partStatus: I_faAppConfigImportPartsUi[keyof I_faAppConfigImportPartsUi] | undefined
  ) => boolean
  onMounted: (hook: () => void) => void
  ref: <T>(value: T) => Ref<T>
  registerComponentDialogStackGuard: (dialogModel: Ref<boolean>) => void
  Result: {
    fromThrowable: <T, E>(fn: () => T, onError: (error: unknown) => E) => () => {
      unwrapOr: <D>(defaultValue: D) => T | D
    }
  }
  runFaAction: <Id extends T_faActionId>(id: Id, payload: I_faActionPayloadMap[Id]) => void
  runFaActionAwait: <Id extends T_faActionId>(
    id: Id,
    payload: I_faActionPayloadMap[Id]
  ) => Promise<boolean>
  watch: (
    source: unknown,
    effect: (value: unknown) => void,
    options?: Record<string, unknown>
  ) => void
}): {
    registerImportExportApplyCheckboxSync: (opts: {
      importApplyKeybinds: Ref<boolean>
      importApplyAppNoteboard: Ref<boolean>
      importApplyAppSettings: Ref<boolean>
      importApplyAppStyling: Ref<boolean>
      importParts: Ref<I_faAppConfigImportPartsUi | null>
    }) => void
    buildImportExportAppConfigDialogModelComputeds: (opts: {
      exportIncludeKeybinds: Ref<boolean>
      exportIncludeAppNoteboard: Ref<boolean>
      exportIncludeAppSettings: Ref<boolean>
      exportIncludeAppStyling: Ref<boolean>
      importApplyKeybinds: Ref<boolean>
      importApplyAppNoteboard: Ref<boolean>
      importApplyAppSettings: Ref<boolean>
      importApplyAppStyling: Ref<boolean>
      importParts: Ref<I_faAppConfigImportPartsUi | null>
    }) => {
      createExportDisabled: ComputedRef<boolean>
      importApplyDisabled: ComputedRef<boolean>
      keybindsImportEnabled: ComputedRef<boolean>
      appNoteboardImportEnabled: ComputedRef<boolean>
      appSettingsImportEnabled: ComputedRef<boolean>
      appStylingImportEnabled: ComputedRef<boolean>
    }
    useImportExportAppConfigDialogModel: (opts: { onRequestClose: () => void }) => {
      appNoteboardImportEnabled: ComputedRef<boolean>
      appSettingsImportEnabled: ComputedRef<boolean>
      appStylingImportEnabled: ComputedRef<boolean>
      createExportDisabled: ComputedRef<boolean>
      dialogModel: Ref<boolean>
      exportIncludeKeybinds: Ref<boolean>
      exportIncludeAppNoteboard: Ref<boolean>
      exportIncludeAppSettings: Ref<boolean>
      exportIncludeAppStyling: Ref<boolean>
      importApplyDisabled: ComputedRef<boolean>
      importApplyKeybinds: Ref<boolean>
      importApplyAppNoteboard: Ref<boolean>
      importApplyAppSettings: Ref<boolean>
      importApplyAppStyling: Ref<boolean>
      importParts: Ref<I_faAppConfigImportPartsUi | null>
      importSessionId: Ref<string>
      keybindsImportEnabled: ComputedRef<boolean>
      onRequestClose: () => void
      view: Ref<T_importExportView>
    }
    importExportDialogClickCreateExport: (b: I_importExportDialogActionBindings) => Promise<void>
    importExportDialogClickPrepareImport: (b: I_importExportDialogActionBindings) => Promise<void>
    importExportDialogClickApplyImport: (b: I_importExportDialogActionBindings) => Promise<void>
    useDialogImportExportAppConfigDialog: (opts: { onRequestClose: () => void }) => {
      dialogModel: Ref<boolean>
      view: Ref<T_importExportView>
      createExportDisabled: ComputedRef<boolean>
      importApplyDisabled: ComputedRef<boolean>
      exportIncludeKeybinds: Ref<boolean>
      exportIncludeAppNoteboard: Ref<boolean>
      exportIncludeAppSettings: Ref<boolean>
      exportIncludeAppStyling: Ref<boolean>
      importApplyKeybinds: Ref<boolean>
      importApplyAppNoteboard: Ref<boolean>
      importApplyAppSettings: Ref<boolean>
      importApplyAppStyling: Ref<boolean>
      keybindsImportEnabled: ComputedRef<boolean>
      appNoteboardImportEnabled: ComputedRef<boolean>
      appSettingsImportEnabled: ComputedRef<boolean>
      appStylingImportEnabled: ComputedRef<boolean>
      importSessionId: Ref<string>
      onClickCreateExport: () => Promise<void>
      onClickImport: () => Promise<void>
      onClickImportSelected: () => Promise<void>
    }
    useDialogImportExportAppConfigLifecycle: (opts: {
      dialogModel: Ref<boolean>
      directInput: Ref<T_dialogName | undefined>
    }) => void
  } {
  function registerImportExportApplyCheckboxSync (opts: {
    importApplyKeybinds: Ref<boolean>
    importApplyAppNoteboard: Ref<boolean>
    importApplyAppSettings: Ref<boolean>
    importApplyAppStyling: Ref<boolean>
    importParts: Ref<I_faAppConfigImportPartsUi | null>
  }): void {
    const {
      importApplyKeybinds,
      importApplyAppNoteboard,
      importApplyAppSettings,
      importApplyAppStyling,
      importParts
    } = opts
    deps.watch(
      [importParts],
      () => {
        const p = importParts.value
        if (p === null) {
          return
        }
        importApplyKeybinds.value = p.keybinds === 'ok'
        importApplyAppNoteboard.value = p.appNoteboard === 'ok'
        importApplyAppSettings.value = p.appSettings === 'ok'
        importApplyAppStyling.value = p.appStyling === 'ok'
      },
      { deep: true }
    )
  }

  function buildImportExportAppConfigDialogModelComputeds (opts: {
    exportIncludeKeybinds: Ref<boolean>
    exportIncludeAppNoteboard: Ref<boolean>
    exportIncludeAppSettings: Ref<boolean>
    exportIncludeAppStyling: Ref<boolean>
    importApplyKeybinds: Ref<boolean>
    importApplyAppNoteboard: Ref<boolean>
    importApplyAppSettings: Ref<boolean>
    importApplyAppStyling: Ref<boolean>
    importParts: Ref<I_faAppConfigImportPartsUi | null>
  }): {
      createExportDisabled: ComputedRef<boolean>
      importApplyDisabled: ComputedRef<boolean>
      keybindsImportEnabled: ComputedRef<boolean>
      appNoteboardImportEnabled: ComputedRef<boolean>
      appSettingsImportEnabled: ComputedRef<boolean>
      appStylingImportEnabled: ComputedRef<boolean>
    } {
    const {
      exportIncludeKeybinds,
      exportIncludeAppNoteboard,
      exportIncludeAppSettings,
      exportIncludeAppStyling,
      importApplyKeybinds,
      importApplyAppNoteboard,
      importApplyAppSettings,
      importApplyAppStyling,
      importParts
    } = opts

    const createExportDisabled = deps.computed(() => {
      return deps.isImportExportCreateExportDisabled({
        includeKeybinds: exportIncludeKeybinds.value,
        includeAppNoteboard: exportIncludeAppNoteboard.value,
        includeAppSettings: exportIncludeAppSettings.value,
        includeAppStyling: exportIncludeAppStyling.value
      })
    })

    const appSettingsImportEnabled = deps.computed(() => {
      return deps.isImportExportPartAvailable(importParts.value?.appSettings)
    })
    const keybindsImportEnabled = deps.computed(() => {
      return deps.isImportExportPartAvailable(importParts.value?.keybinds)
    })
    const appNoteboardImportEnabled = deps.computed(() => {
      return deps.isImportExportPartAvailable(importParts.value?.appNoteboard)
    })
    const appStylingImportEnabled = deps.computed(() => {
      return deps.isImportExportPartAvailable(importParts.value?.appStyling)
    })

    registerImportExportApplyCheckboxSync({
      importApplyKeybinds,
      importApplyAppNoteboard,
      importApplyAppSettings,
      importApplyAppStyling,
      importParts
    })

    const importApplyDisabled = deps.computed(() => {
      return deps.isImportExportApplyDisabled({
        applyAppNoteboard: importApplyAppNoteboard.value,
        applyAppSettings: importApplyAppSettings.value,
        applyAppStyling: importApplyAppStyling.value,
        applyKeybinds: importApplyKeybinds.value,
        importParts: importParts.value
      })
    })

    return {
      appNoteboardImportEnabled,
      appSettingsImportEnabled,
      appStylingImportEnabled,
      createExportDisabled,
      importApplyDisabled,
      keybindsImportEnabled
    }
  }

  function useImportExportAppConfigDialogModel (opts: {
    onRequestClose: () => void
  }) {
    const { onRequestClose } = opts
    const dialogModel = deps.ref(false)
    const view = deps.ref<T_importExportView>('root')
    const exportIncludeKeybinds = deps.ref(true)
    const exportIncludeAppNoteboard = deps.ref(true)
    const exportIncludeAppSettings = deps.ref(true)
    const exportIncludeAppStyling = deps.ref(true)
    const importSessionId = deps.ref('')
    const importParts = deps.ref<I_faAppConfigImportPartsUi | null>(null)
    const importApplyKeybinds = deps.ref(true)
    const importApplyAppNoteboard = deps.ref(true)
    const importApplyAppSettings = deps.ref(true)
    const importApplyAppStyling = deps.ref(true)

    function resetToRoot (): void {
      view.value = 'root'
      importSessionId.value = ''
      importParts.value = null
      exportIncludeKeybinds.value = true
      exportIncludeAppNoteboard.value = true
      exportIncludeAppSettings.value = true
      exportIncludeAppStyling.value = true
      importApplyKeybinds.value = true
      importApplyAppNoteboard.value = true
      importApplyAppSettings.value = true
      importApplyAppStyling.value = true
    }

    function disposeImportSessionIfAny (): void {
      const sid = importSessionId.value
      if (sid !== '') {
        void window.faContentBridgeAPIs?.faAppConfig?.disposeImportSession(sid)
      }
    }

    deps.watch(
      () => dialogModel.value,
      (open: unknown) => {
        if (typeof open !== 'boolean') {
          return
        }
        if (!open) {
          disposeImportSessionIfAny()
          resetToRoot()
        }
      },
      { flush: 'sync' }
    )

    const {
      createExportDisabled,
      importApplyDisabled,
      keybindsImportEnabled,
      appNoteboardImportEnabled,
      appSettingsImportEnabled,
      appStylingImportEnabled
    } = buildImportExportAppConfigDialogModelComputeds({
      exportIncludeKeybinds,
      exportIncludeAppNoteboard,
      exportIncludeAppSettings,
      exportIncludeAppStyling,
      importApplyKeybinds,
      importApplyAppNoteboard,
      importApplyAppSettings,
      importApplyAppStyling,
      importParts
    })

    return {
      appNoteboardImportEnabled,
      appSettingsImportEnabled,
      appStylingImportEnabled,
      createExportDisabled,
      dialogModel,
      exportIncludeKeybinds,
      exportIncludeAppNoteboard,
      exportIncludeAppSettings,
      exportIncludeAppStyling,
      importApplyDisabled,
      importApplyKeybinds,
      importApplyAppNoteboard,
      importApplyAppSettings,
      importApplyAppStyling,
      importParts,
      importSessionId,
      keybindsImportEnabled,
      onRequestClose,
      view
    }
  }

  let importExportIoInFlight = false

  async function importExportDialogClickCreateExport (b: I_importExportDialogActionBindings): Promise<void> {
    const inc = readImportExportIncludeFlags(b)
    if (importExportIoInFlight) {
      return
    }
    importExportIoInFlight = true
    try {
      const ok = await deps.runFaActionAwait('exportAppConfigPackage', inc)
      if (!ok) {
        return
      }
      deps.Notify.create({
        group: false,
        message: deps.i18n.global.t('dialogs.importExportAppConfig.toasts.exportSuccess'),
        type: 'positive'
      })
      if (!importExportSnapshotsMatch(readImportExportIncludeFlags(b), inc)) {
        return
      }
      b.onRequestClose()
    } finally {
      importExportIoInFlight = false
    }
  }

  async function importExportDialogClickPrepareImport (b: I_importExportDialogActionBindings): Promise<void> {
    const api = window.faContentBridgeAPIs?.faAppConfig
    if (api === undefined) {
      return
    }
    if (importExportIoInFlight) {
      return
    }
    importExportIoInFlight = true
    try {
      const r = await api.prepareImport()
      if (r.outcome === 'canceled') {
        void deps.runFaAction('importAppConfigStageResult', { status: 'canceled' })
        return
      }
      if (r.outcome === 'error' || r.sessionId === undefined || r.parts === undefined) {
        void deps.runFaAction('importAppConfigStageResult', {
          errorCode: r.errorName,
          errorMessage: r.errorMessage,
          status: 'fail'
        })
        return
      }
      void deps.runFaAction('importAppConfigStageResult', {
        sessionId: r.sessionId,
        status: 'pass'
      })
      b.importSessionId.value = r.sessionId
      b.importParts.value = r.parts
      b.view.value = 'importSelect'
    } finally {
      importExportIoInFlight = false
    }
  }

  async function importExportDialogClickApplyImport (b: I_importExportDialogActionBindings): Promise<void> {
    const api = window.faContentBridgeAPIs?.faAppConfig
    if (api === undefined || b.importSessionId.value === '') {
      return
    }
    if (importExportIoInFlight) {
      return
    }
    importExportIoInFlight = true
    try {
      const input = readImportExportApplyInput(b)
      const ok = await deps.runFaActionAwait('importAppConfigApply', input)
      if (!ok) {
        return
      }
      deps.Notify.create({
        group: false,
        message: deps.i18n.global.t('dialogs.importExportAppConfig.toasts.importSuccess'),
        type: 'positive'
      })
      if (!importExportSnapshotsMatch(readImportExportApplyInput(b), input)) {
        return
      }
      b.onRequestClose()
    } finally {
      importExportIoInFlight = false
    }
  }

  function useDialogImportExportAppConfigDialog (opts: { onRequestClose: () => void }) {
    const m = useImportExportAppConfigDialogModel(opts)
    const bindings: I_importExportDialogActionBindings = {
      exportIncludeAppNoteboard: m.exportIncludeAppNoteboard,
      exportIncludeAppSettings: m.exportIncludeAppSettings,
      exportIncludeAppStyling: m.exportIncludeAppStyling,
      exportIncludeKeybinds: m.exportIncludeKeybinds,
      importApplyAppNoteboard: m.importApplyAppNoteboard,
      importApplyAppSettings: m.importApplyAppSettings,
      importApplyAppStyling: m.importApplyAppStyling,
      importApplyKeybinds: m.importApplyKeybinds,
      importParts: m.importParts,
      importSessionId: m.importSessionId,
      onRequestClose: m.onRequestClose,
      view: m.view
    }
    const onClickCreateExport = async (): Promise<void> => importExportDialogClickCreateExport(bindings)
    const onClickImport = async (): Promise<void> => importExportDialogClickPrepareImport(bindings)
    const onClickImportSelected = async (): Promise<void> => importExportDialogClickApplyImport(bindings)

    const {
      appNoteboardImportEnabled,
      appSettingsImportEnabled,
      appStylingImportEnabled,
      createExportDisabled,
      dialogModel,
      exportIncludeAppNoteboard,
      exportIncludeAppSettings,
      exportIncludeAppStyling,
      exportIncludeKeybinds,
      importApplyDisabled,
      importApplyAppNoteboard,
      importApplyAppSettings,
      importApplyAppStyling,
      importApplyKeybinds,
      importSessionId,
      keybindsImportEnabled,
      view
    } = m
    return {
      appNoteboardImportEnabled,
      appSettingsImportEnabled,
      appStylingImportEnabled,
      createExportDisabled,
      dialogModel,
      exportIncludeAppNoteboard,
      exportIncludeAppSettings,
      exportIncludeAppStyling,
      exportIncludeKeybinds,
      importApplyDisabled,
      importApplyAppNoteboard,
      importApplyAppSettings,
      importApplyAppStyling,
      importApplyKeybinds,
      importSessionId,
      keybindsImportEnabled,
      onClickCreateExport,
      onClickImport,
      onClickImportSelected,
      view
    }
  }

  function resolveDialogComponentStore (): I_dialogComponentStoreLike | null {
    return deps.Result.fromThrowable(
      () => deps.S_DialogComponent(),
      () => null
    )().unwrapOr(null)
  }

  function useDialogImportExportAppConfigLifecycle (opts: {
    dialogModel: Ref<boolean>
    directInput: Ref<T_dialogName | undefined>
  }): void {
    const { dialogModel, directInput } = opts

    deps.registerComponentDialogStackGuard(dialogModel)

    function openDialog (): void {
      dialogModel.value = true
    }

    deps.watch(
      () => resolveDialogComponentStore()?.dialogUUID,
      () => {
        const s = resolveDialogComponentStore()
        if (s?.dialogToOpen === 'ImportExportAppConfig') {
          openDialog()
        }
      }
    )

    deps.watch(
      () => directInput.value,
      () => {
        if (directInput.value === 'ImportExportAppConfig') {
          openDialog()
        }
      }
    )

    deps.onMounted(() => {
      if (directInput.value === 'ImportExportAppConfig') {
        openDialog()
      }
    })
  }

  return {
    registerImportExportApplyCheckboxSync,
    buildImportExportAppConfigDialogModelComputeds,
    useImportExportAppConfigDialogModel,
    importExportDialogClickCreateExport,
    importExportDialogClickPrepareImport,
    importExportDialogClickApplyImport,
    useDialogImportExportAppConfigDialog,
    useDialogImportExportAppConfigLifecycle
  }
}
