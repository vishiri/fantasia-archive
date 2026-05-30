import type { I_computedRef, I_ref } from 'app/types/I_vueCompositionShims'
import type { I_faActionHistoryEntry, T_faActionHistoryStatus, T_faActionKind } from 'app/types/I_faActionManagerDomain'
import type { T_dialogName } from 'app/types/T_appDialogsAndDocuments'
import type {
  T_dialogActionMonitorStatusBadge,
  T_dialogActionMonitorTableColumn
} from 'app/types/I_dialogActionMonitorUi'

export type T_createDialogActionMonitorDeps = {
  buildDialogActionMonitorColumns: (t: (key: string) => string) => T_dialogActionMonitorTableColumn[]
  buildDialogActionMonitorRowClipboardJson: (row: I_faActionHistoryEntry) => string
  buildDialogActionMonitorStatusBadge: (
    status: T_faActionHistoryStatus,
    t: (key: string) => string
  ) => T_dialogActionMonitorStatusBadge
  copyToClipboard: (text: string) => Promise<unknown>
  formatDialogActionMonitorActionKind: (
    kind: T_faActionKind,
    t: (key: string) => string
  ) => string
  getDialogComponentStore: () => { dialogToOpen?: unknown; dialogUUID?: unknown } | null
  i18n: { global: { t: (key: string, params?: Record<string, string>) => string } }
  isDialogActionMonitorDirectInput: (input: T_dialogName | undefined) => boolean
  isDialogActionMonitorStoreTarget: (dialogToOpen: unknown) => boolean
  Notify: { create: (opts: Record<string, unknown>) => void }
  onMounted: (hook: () => void) => void
  ref: <T>(value: T) => I_ref<T>
  registerComponentDialogStackGuard: (dialogModel: I_ref<boolean>) => void
  ResultAsync: {
    fromPromise: <T, E>(
      p: Promise<T>,
      mapErr: (e: unknown) => E
    ) => { match: (onOk: () => void, onErr: (e: unknown) => void) => void }
  }
  snapshotActionHistory: () => I_faActionHistoryEntry[]
  useDialogKeybindSettingsTableLayout: (args: {
    dialogModel: I_ref<boolean>
    getSectionElement: () => HTMLElement | null
  }) => { tableMaxHeightPx: I_ref<number | null> }
  watch: (source: () => unknown, effect: () => void) => void
  computed: <T>(getter: () => T) => I_computedRef<T>
}
