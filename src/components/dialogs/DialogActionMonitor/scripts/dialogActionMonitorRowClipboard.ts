import { copyToClipboard, Notify } from 'quasar'

import { i18n } from 'app/i18n/externalFileLoader'
import type { I_faActionHistoryEntry } from 'app/types/I_faActionManagerDomain'

import { buildDialogActionMonitorRowClipboardJson } from './dialogActionMonitorTable'

/**
 * Copy a single action history row to the clipboard as pretty-printed JSON, surfacing one positive / negative
 * 'Notify.create' per outcome. Failures also log via 'console.error' to mirror the action manager's reporting style.
 */
export async function copyDialogActionMonitorRowToClipboard (row: I_faActionHistoryEntry): Promise<void> {
  const payload = buildDialogActionMonitorRowClipboardJson(row)
  try {
    await copyToClipboard(payload)
    Notify.create({
      caption: i18n.global.t('dialogs.actionMonitor.copy.success'),
      color: 'positive',
      icon: 'mdi-clipboard-check-outline',
      message: row.id,
      timeout: 2500,
      type: 'positive'
    })
  } catch (error: unknown) {
    const reason = error instanceof Error ? error.message : String(error)
    console.error('[DialogActionMonitor] Failed to copy action row to clipboard:', reason)
    Notify.create({
      caption: reason,
      color: 'negative',
      icon: 'mdi-clipboard-alert-outline',
      message: i18n.global.t('dialogs.actionMonitor.copy.failed'),
      timeout: 4000,
      type: 'negative'
    })
  }
}
