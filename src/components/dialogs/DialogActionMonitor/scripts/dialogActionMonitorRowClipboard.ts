import { copyToClipboard, Notify } from 'quasar'
import { ResultAsync } from 'neverthrow'

import { i18n } from 'app/i18n/externalFileLoader'
import type { I_faActionHistoryEntry } from 'app/types/I_faActionManagerDomain'

import { buildDialogActionMonitorRowClipboardJson } from './dialogActionMonitorTable'

/**
 * Copy a single action history row to the clipboard as pretty-printed JSON, surfacing one positive / negative
 * 'Notify.create' per outcome. Both payloads pass 'faSkipNotifyConsoleLog' so the boot-time notify console mirror skips them;
 * failures also log via 'console.error' before the negative toast.
 */
export async function copyDialogActionMonitorRowToClipboard (row: I_faActionHistoryEntry): Promise<void> {
  const payload = buildDialogActionMonitorRowClipboardJson(row)
  await ResultAsync.fromPromise(copyToClipboard(payload), (error): unknown => error).match(
    (): void => {
      Notify.create({
        caption: i18n.global.t(
          'dialogs.actionMonitor.copy.successCaption',
          {
            actionId: row.id
          }
        ),
        color: 'positive',
        faSkipNotifyConsoleLog: true,
        icon: 'mdi-clipboard-check-outline',
        message: i18n.global.t('dialogs.actionMonitor.copy.success'),
        timeout: 2500,
        type: 'positive'
      })
    },
    (error: unknown): void => {
      const reason = error instanceof Error ? error.message : String(error)
      console.error('[DialogActionMonitor] Failed to copy action row to clipboard:', reason)
      Notify.create({
        caption: reason,
        color: 'negative',
        faSkipNotifyConsoleLog: true,
        icon: 'mdi-clipboard-alert-outline',
        message: i18n.global.t('dialogs.actionMonitor.copy.failed'),
        timeout: 4000,
        type: 'negative'
      })
    }
  )
}
