import { i18n } from 'app/i18n/externalFileLoader'
import { registerComponentDialogStackGuard } from 'app/src/scripts/appGlobalManagementUI/dialogManagement_manager'
import { snapshotActionHistory } from 'app/src/scripts/actionManager/faActionManagerHistory_manager'
import { useDialogKeybindSettingsTableLayout } from 'app/src/components/dialogs/DialogKeybindSettings/scripts/dialogKeybindSettings_manager'
import { S_DialogComponent } from 'src/stores/S_Dialog'
import { copyToClipboard, Notify } from 'quasar'
import { computed, onMounted, ref, watch } from 'vue'
import { ResultAsync } from 'neverthrow'

import {
  isDialogActionMonitorDirectInput,
  isDialogActionMonitorStoreTarget
} from './functions/dialogActionMonitorDialogInput'
import {
  buildDialogActionMonitorColumns as buildDialogActionMonitorColumnsImpl,
  buildDialogActionMonitorRowClipboardJson,
  buildDialogActionMonitorStatusBadge,
  formatDialogActionMonitorActionKind
} from './functions/dialogActionMonitorTableModel'
import { createDialogActionMonitor } from './functions/createDialogActionMonitor'

const dialogActionMonitorApi = createDialogActionMonitor({
  buildDialogActionMonitorColumns: buildDialogActionMonitorColumnsImpl,
  buildDialogActionMonitorRowClipboardJson,
  buildDialogActionMonitorStatusBadge,
  copyToClipboard,
  formatDialogActionMonitorActionKind,
  getDialogComponentStore: (): { dialogToOpen?: unknown; dialogUUID?: unknown } | null => {
    try {
      return S_DialogComponent() as { dialogToOpen?: unknown; dialogUUID?: unknown }
    } catch {
      return null
    }
  },
  i18n,
  isDialogActionMonitorDirectInput,
  isDialogActionMonitorStoreTarget,
  Notify,
  computed,
  onMounted,
  ref,
  registerComponentDialogStackGuard,
  ResultAsync,
  snapshotActionHistory,
  useDialogKeybindSettingsTableLayout,
  watch
})

export const formatDialogActionMonitorActionKindForUi =
  dialogActionMonitorApi.formatDialogActionMonitorActionKindForUi

export const buildDialogActionMonitorStatusBadgeForUi =
  dialogActionMonitorApi.buildDialogActionMonitorStatusBadgeForUi

export const resolveDialogComponentStore = dialogActionMonitorApi.resolveDialogComponentStore

export const buildDialogActionMonitorColumns = dialogActionMonitorApi.buildDialogActionMonitorColumns

export const copyDialogActionMonitorRowToClipboard =
  dialogActionMonitorApi.copyDialogActionMonitorRowToClipboard

export const useDialogActionMonitorTableLayout = dialogActionMonitorApi.useDialogActionMonitorTableLayout

export const useDialogActionMonitor = dialogActionMonitorApi.useDialogActionMonitor
