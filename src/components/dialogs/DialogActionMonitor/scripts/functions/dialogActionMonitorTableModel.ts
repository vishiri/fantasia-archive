import type {
  I_faActionHistoryEntry,
  T_faActionHistoryStatus,
  T_faActionKind
} from 'app/types/I_faActionManagerDomain'
import type {
  T_dialogActionMonitorStatusBadge,
  I_dialogActionMonitorTableColumn,
  T_dialogActionMonitorTranslate
} from 'app/types/I_dialogActionMonitorUi'

/**
 * True when the history row captured a non-empty payload preview at enqueue time.
 */
export function hasDialogActionMonitorPayload (entry: I_faActionHistoryEntry): boolean {
  const preview = entry.payloadPreview
  return typeof preview === 'string' && preview.trim() !== ''
}

/**
 * 'HH:MM:SS' wall-clock display for epoch milliseconds (start / finish / enqueue).
 */
export function formatDialogActionMonitorTimestamp (timestamp: number | undefined): string {
  if (typeof timestamp !== 'number' || Number.isNaN(timestamp)) {
    return ''
  }
  const date = new Date(timestamp)
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${hours}:${minutes}:${seconds}`
}

/**
 * Localized display for the execution kind column (sync vs async).
 */
export function formatDialogActionMonitorActionKind (
  kind: T_faActionKind,
  t: T_dialogActionMonitorTranslate
): string {
  if (kind === 'sync') {
    return t('dialogs.actionMonitor.actionKind.sync')
  }
  return t('dialogs.actionMonitor.actionKind.async')
}

/**
 * Fixed q-table column descriptors for the action monitor history grid.
 */
export function buildDialogActionMonitorColumns (
  t: T_dialogActionMonitorTranslate
): I_dialogActionMonitorTableColumn[] {
  const actionLabel = t('dialogs.actionMonitor.columns.action')
  const startTimeLabel = t('dialogs.actionMonitor.columns.startTime')
  const finishTimeLabel = t('dialogs.actionMonitor.columns.finishTime')
  const payloadLabel = t('dialogs.actionMonitor.columns.payload')
  const typeLabel = t('dialogs.actionMonitor.columns.type')
  const statusLabel = t('dialogs.actionMonitor.columns.status')
  const actionColumn: I_dialogActionMonitorTableColumn = {
    align: 'left',
    field: 'id',
    label: actionLabel,
    name: 'action',
    sortable: false
  }
  const startTimeColumn: I_dialogActionMonitorTableColumn = {
    align: 'left',
    field: 'startedAt',
    label: startTimeLabel,
    name: 'startTime',
    sortable: false
  }
  const finishTimeColumn: I_dialogActionMonitorTableColumn = {
    align: 'left',
    field: 'finishedAt',
    label: finishTimeLabel,
    name: 'finishTime',
    sortable: false
  }
  const payloadColumn: I_dialogActionMonitorTableColumn = {
    align: 'center',
    field: 'payloadPreview',
    label: payloadLabel,
    name: 'payload',
    sortable: false
  }
  const typeColumn: I_dialogActionMonitorTableColumn = {
    align: 'left',
    field: 'kind',
    label: typeLabel,
    name: 'type',
    sortable: false
  }
  const statusColumn: I_dialogActionMonitorTableColumn = {
    align: 'center',
    field: 'status',
    label: statusLabel,
    name: 'status',
    sortable: false
  }
  return [
    actionColumn,
    startTimeColumn,
    finishTimeColumn,
    payloadColumn,
    typeColumn,
    statusColumn
  ]
}

export function buildDialogActionMonitorStatusBadge (
  status: T_faActionHistoryStatus,
  t: T_dialogActionMonitorTranslate
): T_dialogActionMonitorStatusBadge {
  if (status === 'success') {
    const label = t('dialogs.actionMonitor.status.success')
    return {
      colorClass: 'text-positive',
      icon: 'mdi-check',
      isSpinner: false,
      label
    }
  }
  if (status === 'failed') {
    const label = t('dialogs.actionMonitor.status.failed')
    return {
      colorClass: 'text-negative',
      icon: 'mdi-close',
      isSpinner: false,
      label
    }
  }
  if (status === 'running') {
    const label = t('dialogs.actionMonitor.status.running')
    return {
      colorClass: 'text-primary-bright',
      icon: '',
      isSpinner: true,
      label
    }
  }
  const label = t('dialogs.actionMonitor.status.queued')
  return {
    colorClass: 'fa-text-status-queued',
    icon: 'mdi-timer-sand-empty',
    isSpinner: false,
    label
  }
}

function parseDialogActionMonitorPayloadPreview (payloadPreview: string | undefined): unknown {
  if (payloadPreview === undefined || payloadPreview === '') {
    return undefined
  }
  try {
    return JSON.parse(payloadPreview) as unknown
  } catch {
    return undefined
  }
}

/**
 * Pretty-printed JSON snapshot of a row used by the click-to-copy clipboard flow.
 */
export function buildDialogActionMonitorRowClipboardJson (entry: I_faActionHistoryEntry): string {
  const { payloadPreview, ...rest } = entry
  const parsedPayload = parseDialogActionMonitorPayloadPreview(payloadPreview)
  const copyTarget: Record<string, unknown> = { ...rest }
  if (parsedPayload !== undefined) {
    copyTarget.payload = parsedPayload
  }
  if (payloadPreview !== undefined && payloadPreview !== '') {
    copyTarget.payloadPreview = payloadPreview
  }
  return JSON.stringify(copyTarget, null, 2)
}
