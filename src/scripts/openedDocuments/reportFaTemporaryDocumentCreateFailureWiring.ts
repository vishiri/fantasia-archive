import { Notify } from 'quasar'

import { i18n } from 'app/i18n/externalFileLoader'

/**
 * Toast when a temporary document create fails after the caller already moved on.
 */
export function reportFaTemporaryDocumentCreateFailure (error: unknown): void {
  console.error('[faOpenedDocuments] create temporary document failed', error)
  const fallback = i18n.global.t('globalFunctionality.faOpenedDocuments.createTemporaryError')
  const errorMessage = error instanceof Error ? error.message.trim() : ''
  const stringMessage = typeof error === 'string' ? error.trim() : ''
  let message = fallback
  if (errorMessage.length > 0) {
    message = errorMessage
  } else if (stringMessage.length > 0) {
    message = stringMessage
  }
  Notify.create({
    faSkipNotifyConsoleLog: true,
    group: false,
    message,
    type: 'negative'
  })
}
