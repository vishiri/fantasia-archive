import type { I_faActionHistoryEntry } from 'app/types/I_faActionManagerDomain'

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

export type T_dialogActionMonitorTableColumn = {
  align: 'left' | 'center'
  field: keyof I_faActionHistoryEntry
  label: string
  name: T_dialogActionMonitorColumnName
  sortable: false
}

export type I_dialogActionMonitorTableColumn = T_dialogActionMonitorTableColumn

export type T_dialogActionMonitorStatusBadge = {
  colorClass: string
  icon: string
  isSpinner: boolean
  label: string
}

export type T_dialogActionMonitorTranslate = (key: string) => string
