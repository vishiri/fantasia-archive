import type { I_faActionHistoryEntry, T_faActionHistoryStatus } from 'app/types/I_faActionManagerDomain'
import { i18n } from 'app/i18n/externalFileLoader'

/**
 * Fixed render columns for the action monitor table.
 * Names are the column 'name' values referenced by the q-table 'body-cell' slot bindings.
 */
export const DIALOG_ACTION_MONITOR_COLUMN_NAMES = ['action', 'timestamp', 'status'] as const

export type T_dialogActionMonitorColumnName = typeof DIALOG_ACTION_MONITOR_COLUMN_NAMES[number]

export interface I_dialogActionMonitorTableColumn {
  name: T_dialogActionMonitorColumnName
  label: string
  field: T_dialogActionMonitorColumnName
  align: 'left' | 'center'
  sortable: false
}

export function buildDialogActionMonitorColumns (): I_dialogActionMonitorTableColumn[] {
  return [
    {
      align: 'left',
      field: 'action',
      label: i18n.global.t('dialogs.actionMonitor.columns.action'),
      name: 'action',
      sortable: false
    },
    {
      align: 'left',
      field: 'timestamp',
      label: i18n.global.t('dialogs.actionMonitor.columns.timestamp'),
      name: 'timestamp',
      sortable: false
    },
    {
      align: 'center',
      field: 'status',
      label: i18n.global.t('dialogs.actionMonitor.columns.status'),
      name: 'status',
      sortable: false
    }
  ]
}

/**
 * 'HH:MM:SS' wall-clock display. Uses the 'enqueuedAt' timestamp from the snapshot.
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
   * Quasar 'q-icon' name; empty string means "no static icon" (use the spinner template branch instead for 'running').
   */
  icon: string
  /**
   * Quasar text-color class; aligned with the project's negative / positive colors so the table reads at a glance.
   */
  colorClass: string
  /**
   * Translated status label for accessibility / tooltip use.
   */
  label: string
  /**
   * When 'true' the status cell should render the animated 'q-spinner-clock' instead of a static icon.
   */
  isSpinner: boolean
}

export function buildDialogActionMonitorStatusBadge (status: T_faActionHistoryStatus): I_dialogActionMonitorStatusBadge {
  if (status === 'success') {
    return {
      colorClass: 'text-positive',
      icon: 'mdi-check',
      isSpinner: false,
      label: i18n.global.t('dialogs.actionMonitor.status.success')
    }
  }
  if (status === 'failed') {
    return {
      colorClass: 'text-negative',
      icon: 'mdi-close',
      isSpinner: false,
      label: i18n.global.t('dialogs.actionMonitor.status.failed')
    }
  }
  if (status === 'running') {
    return {
      colorClass: 'text-primary-bright',
      icon: '',
      isSpinner: true,
      label: i18n.global.t('dialogs.actionMonitor.status.running')
    }
  }
  return {
    colorClass: 'text-grey-5',
    icon: '',
    isSpinner: false,
    label: i18n.global.t('dialogs.actionMonitor.status.queued')
  }
}

/**
 * Tooltip body shown on hover over an action row. Empty payload preview falls back to the localized 'no payload' label.
 */
export function buildDialogActionMonitorPayloadTooltip (entry: I_faActionHistoryEntry): string {
  if (entry.payloadPreview === undefined || entry.payloadPreview === '') {
    return i18n.global.t('dialogs.actionMonitor.payloadTooltipNone')
  }
  return `${i18n.global.t('dialogs.actionMonitor.payloadTooltipPrefix')} ${entry.payloadPreview}`
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
