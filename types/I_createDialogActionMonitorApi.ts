import type { I_computedRef, I_ref } from 'app/types/I_vueCompositionShims'
import type { I_faActionHistoryEntry, T_faActionHistoryStatus, T_faActionKind } from 'app/types/I_faActionManagerDomain'
import type { T_dialogName } from 'app/types/T_appDialogsAndDocuments'
import type {
  T_dialogActionMonitorStatusBadge,
  T_dialogActionMonitorTableColumn
} from 'app/types/I_dialogActionMonitorUi'

export type T_createDialogActionMonitorApi = {
  formatDialogActionMonitorActionKindForUi: (kind: T_faActionKind) => string
  buildDialogActionMonitorStatusBadgeForUi: (
    status: T_faActionHistoryStatus
  ) => T_dialogActionMonitorStatusBadge
  resolveDialogComponentStore: () => { dialogToOpen?: unknown; dialogUUID?: unknown } | null
  buildDialogActionMonitorColumns: () => T_dialogActionMonitorTableColumn[]
  copyDialogActionMonitorRowToClipboard: (row: I_faActionHistoryEntry) => Promise<void>
  useDialogActionMonitorTableLayout: (dialogModel: I_ref<boolean>) => {
    dialogActionMonitorTableHeightStyle: I_computedRef<Record<string, string> | undefined>
    tableScrollHostRef: I_ref<HTMLElement | null>
  }
  useDialogActionMonitor: (props: {
    directInput?: T_dialogName
    directHistorySnapshot?: I_faActionHistoryEntry[]
  }) => {
    columns: T_dialogActionMonitorTableColumn[]
    dialogActionMonitorTableHeightStyle: I_computedRef<Record<string, string> | undefined>
    dialogModel: I_ref<boolean>
    documentName: I_ref<string>
    onDialogShow: () => void
    onRowClick: (_event: Event, row: I_faActionHistoryEntry) => void
    rows: I_ref<I_faActionHistoryEntry[]>
    tableScrollHostRef: I_ref<HTMLElement | null>
  }
}
