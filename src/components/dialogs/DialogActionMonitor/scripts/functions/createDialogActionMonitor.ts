import type { I_computedRef, I_ref } from 'app/types/I_vueCompositionShims'
import type { I_faActionHistoryEntry, T_faActionHistoryStatus, T_faActionKind } from 'app/types/I_faActionManagerDomain'
import type { T_dialogName } from 'app/types/T_appDialogsAndDocuments'
import type { T_createDialogActionMonitorApi } from 'app/types/I_createDialogActionMonitorApi'
import type { T_createDialogActionMonitorDeps } from 'app/types/I_createDialogActionMonitorDeps'
import type {
  T_dialogActionMonitorStatusBadge,
  T_dialogActionMonitorTableColumn
} from 'app/types/I_dialogActionMonitorUi'

async function copyDialogActionMonitorRowToClipboard (
  deps: T_createDialogActionMonitorDeps,
  row: I_faActionHistoryEntry
): Promise<void> {
  const payload = deps.buildDialogActionMonitorRowClipboardJson(row)
  await deps.ResultAsync.fromPromise(deps.copyToClipboard(payload), (error): unknown => error).match(
    (): void => {
      deps.Notify.create({
        caption: deps.i18n.global.t(
          'dialogs.actionMonitor.copy.successCaption',
          {
            actionId: row.id
          }
        ),
        color: 'positive',
        faSkipNotifyConsoleLog: true,
        icon: 'mdi-clipboard-check-outline',
        message: deps.i18n.global.t('dialogs.actionMonitor.copy.success'),
        timeout: 2500,
        type: 'positive'
      })
    },
    (error: unknown): void => {
      const reason = error instanceof Error ? error.message : String(error)
      console.error('[DialogActionMonitor] Failed to copy action row to clipboard:', reason)
      deps.Notify.create({
        caption: reason,
        color: 'negative',
        faSkipNotifyConsoleLog: true,
        icon: 'mdi-clipboard-alert-outline',
        message: deps.i18n.global.t('dialogs.actionMonitor.copy.failed'),
        timeout: 4000,
        type: 'negative'
      })
    }
  )
}

function dialogActionMonitorRefreshRows (
  deps: T_createDialogActionMonitorDeps,
  props: { directHistorySnapshot?: I_faActionHistoryEntry[] },
  rows: I_ref<I_faActionHistoryEntry[]>
): void {
  if (props.directHistorySnapshot !== undefined) {
    rows.value = props.directHistorySnapshot.map((entry) => {
      return { ...entry }
    })
    return
  }
  rows.value = deps.snapshotActionHistory()
}

function dialogActionMonitorOpenDialog (
  documentName: I_ref<string>,
  dialogModel: I_ref<boolean>,
  refreshRows: () => void,
  input: T_dialogName
): void {
  documentName.value = input
  refreshRows()
  dialogModel.value = true
}

function useDialogActionMonitorTableLayout (
  deps: T_createDialogActionMonitorDeps,
  dialogModel: I_ref<boolean>
): {
    dialogActionMonitorTableHeightStyle: I_computedRef<Record<string, string> | undefined>
    tableScrollHostRef: I_ref<HTMLElement | null>
  } {
  const tableScrollHostRef = deps.ref<HTMLElement | null>(null)
  const { tableMaxHeightPx } = deps.useDialogKeybindSettingsTableLayout({
    dialogModel,
    getSectionElement (): HTMLElement | null {
      return tableScrollHostRef.value
    }
  })
  const dialogActionMonitorTableHeightStyle = deps.computed((): Record<string, string> | undefined => {
    const px = tableMaxHeightPx.value
    if (px === null) {
      return undefined
    }
    return {
      maxHeight: `${String(px)}px`
    }
  })
  return {
    dialogActionMonitorTableHeightStyle,
    tableScrollHostRef
  }
}

function useDialogActionMonitor (
  deps: T_createDialogActionMonitorDeps,
  props: {
    directInput?: T_dialogName
    directHistorySnapshot?: I_faActionHistoryEntry[]
  },
  resolveDialogComponentStore: () => { dialogToOpen?: unknown; dialogUUID?: unknown } | null,
  buildDialogActionMonitorColumns: () => T_dialogActionMonitorTableColumn[]
): {
    columns: T_dialogActionMonitorTableColumn[]
    dialogActionMonitorTableHeightStyle: I_computedRef<Record<string, string> | undefined>
    dialogModel: I_ref<boolean>
    documentName: I_ref<string>
    onDialogShow: () => void
    onRowClick: (_event: Event, row: I_faActionHistoryEntry) => void
    rows: I_ref<I_faActionHistoryEntry[]>
    tableScrollHostRef: I_ref<HTMLElement | null>
  } {
  const dialogModel = deps.ref(false)
  deps.registerComponentDialogStackGuard(dialogModel)
  const {
    dialogActionMonitorTableHeightStyle,
    tableScrollHostRef
  } = useDialogActionMonitorTableLayout(deps, dialogModel)
  const documentName = deps.ref('')
  const columns = buildDialogActionMonitorColumns()
  const rows = deps.ref<I_faActionHistoryEntry[]>([])

  const refreshRows = (): void => {
    dialogActionMonitorRefreshRows(deps, props, rows)
  }

  const openDialog = (input: T_dialogName): void => {
    dialogActionMonitorOpenDialog(documentName, dialogModel, refreshRows, input)
  }

  const onDialogShow = (): void => {
    refreshRows()
  }

  const onRowClick = (_event: Event, row: I_faActionHistoryEntry): void => {
    void copyDialogActionMonitorRowToClipboard(deps, row)
  }

  deps.watch(() => resolveDialogComponentStore()?.dialogUUID, () => {
    const componentDialogStore = resolveDialogComponentStore()
    if (
      componentDialogStore !== null &&
      deps.isDialogActionMonitorStoreTarget(componentDialogStore.dialogToOpen)
    ) {
      openDialog(componentDialogStore.dialogToOpen as T_dialogName)
    }
  })

  deps.watch(() => props.directInput, () => {
    if (deps.isDialogActionMonitorDirectInput(props.directInput)) {
      openDialog(props.directInput as T_dialogName)
    }
  })

  deps.onMounted(() => {
    if (deps.isDialogActionMonitorDirectInput(props.directInput)) {
      openDialog(props.directInput as T_dialogName)
    }
  })

  return {
    columns,
    dialogActionMonitorTableHeightStyle,
    dialogModel,
    documentName,
    onDialogShow,
    onRowClick,
    rows,
    tableScrollHostRef
  }
}

export function createDialogActionMonitor (deps: T_createDialogActionMonitorDeps): T_createDialogActionMonitorApi {
  const t = (key: string): string => deps.i18n.global.t(key)

  const formatDialogActionMonitorActionKindForUi = (kind: T_faActionKind): string => {
    return deps.formatDialogActionMonitorActionKind(kind, t)
  }

  const buildDialogActionMonitorStatusBadgeForUi = (
    status: T_faActionHistoryStatus
  ): T_dialogActionMonitorStatusBadge => {
    return deps.buildDialogActionMonitorStatusBadge(status, t)
  }

  const resolveDialogComponentStore = (): { dialogToOpen?: unknown; dialogUUID?: unknown } | null => {
    return deps.getDialogComponentStore()
  }

  const buildDialogActionMonitorColumns = (): T_dialogActionMonitorTableColumn[] => {
    return deps.buildDialogActionMonitorColumns(t)
  }

  return {
    buildDialogActionMonitorColumns,
    buildDialogActionMonitorStatusBadgeForUi,
    copyDialogActionMonitorRowToClipboard: (row) => copyDialogActionMonitorRowToClipboard(deps, row),
    formatDialogActionMonitorActionKindForUi,
    resolveDialogComponentStore,
    useDialogActionMonitor: (props) => useDialogActionMonitor(
      deps,
      props,
      resolveDialogComponentStore,
      buildDialogActionMonitorColumns
    ),
    useDialogActionMonitorTableLayout: (dialogModel) => useDialogActionMonitorTableLayout(deps, dialogModel)
  }
}
