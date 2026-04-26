import type {
  I_faActionHistoryEntry,
  T_faActionHistoryStatus,
  T_faActionKind
} from 'app/types/I_faActionManagerDomain'
import { i18n } from 'app/i18n/externalFileLoader'

/**
 * Fixed render columns for the action monitor table.
 * Names are the column 'name' values referenced by the q-table 'body-cell' slot bindings.
 */
export const DIALOG_ACTION_MONITOR_COLUMN_NAMES = [
  'action',
  'startTime',
  'finishTime',
  'payload',
  'type',
  'status'
] as const

export type T_dialogActionMonitorColumnName = typeof DIALOG_ACTION_MONITOR_COLUMN_NAMES[number]

export interface I_dialogActionMonitorTableColumn {
  name: T_dialogActionMonitorColumnName
  label: string
  field: keyof I_faActionHistoryEntry
  align: 'left' | 'center'
  sortable: false
}

export function buildDialogActionMonitorColumns (): I_dialogActionMonitorTableColumn[] {
  const actionLabel = i18n.global.t('dialogs.actionMonitor.columns.action')
  const startTimeLabel = i18n.global.t('dialogs.actionMonitor.columns.startTime')
  const finishTimeLabel = i18n.global.t('dialogs.actionMonitor.columns.finishTime')
  const payloadLabel = i18n.global.t('dialogs.actionMonitor.columns.payload')
  const typeLabel = i18n.global.t('dialogs.actionMonitor.columns.type')
  const statusLabel = i18n.global.t('dialogs.actionMonitor.columns.status')
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

/**
 * True when the history row captured a non-empty payload preview at enqueue time.
 */
export function hasDialogActionMonitorPayload (entry: I_faActionHistoryEntry): boolean {
  const preview = entry.payloadPreview
  return typeof preview === 'string' && preview.trim() !== ''
}

/**
 * Localized display for the execution kind column (sync vs async).
 */
export function formatDialogActionMonitorActionKind (kind: T_faActionKind): string {
  if (kind === 'sync') {
    return i18n.global.t('dialogs.actionMonitor.actionKind.sync')
  }
  return i18n.global.t('dialogs.actionMonitor.actionKind.async')
}

/**
 * 'HH:MM:SS' wall-clock display for epoch milliseconds (start / finish / enqueue).
 * Returns an empty string for missing timestamps so the table cell stays clean.
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

export interface I_dialogActionMonitorStatusBadge {
  /**
   * Quasar 'q-icon' name; empty string means "no static icon" (use the spinner template branch for 'running' instead).
   */
  icon: string
  /**
   * Text color helper from globals/faSemanticText.scss (and Quasar brand util classes), so status tints follow :root --fa-color-*.
   */
  colorClass: string
  /**
   * Translated status label for accessibility, screen-reader text, and status-cell tooltips.
   */
  label: string
  /**
   * When 'true' the status cell should render the animated 'q-spinner-gears' instead of a static icon.
   */
  isSpinner: boolean
}

export function buildDialogActionMonitorStatusBadge (status: T_faActionHistoryStatus): I_dialogActionMonitorStatusBadge {
  if (status === 'success') {
    const label = i18n.global.t('dialogs.actionMonitor.status.success')
    return {
      colorClass: 'text-positive',
      icon: 'mdi-check',
      isSpinner: false,
      label
    }
  }
  if (status === 'failed') {
    const label = i18n.global.t('dialogs.actionMonitor.status.failed')
    return {
      colorClass: 'text-negative',
      icon: 'mdi-close',
      isSpinner: false,
      label
    }
  }
  if (status === 'running') {
    const label = i18n.global.t('dialogs.actionMonitor.status.running')
    return {
      colorClass: 'text-primary-bright',
      icon: '',
      isSpinner: true,
      label
    }
  }
  const label = i18n.global.t('dialogs.actionMonitor.status.queued')
  // MDI v5 webfont (`@quasar/extras/mdi-v5`) exposes timer-sand icons, not `mdi-hourglass`.
  return {
    colorClass: 'fa-text-status-queued',
    icon: 'mdi-timer-sand-empty',
    isSpinner: false,
    label
  }
}

/**
 * Pretty-printed JSON snapshot of a row used by the click-to-copy clipboard flow.
 * 'payloadPreview' holds the JSON-stringified payload captured at enqueue time, so we re-parse it back into
 * a structured 'payload' field when possible to keep the copied JSON ergonomic for the user.
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
