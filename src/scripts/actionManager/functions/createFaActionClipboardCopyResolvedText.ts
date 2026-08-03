import type { T_faActionHandlerContinuation } from 'app/types/I_faActionManagerDomain'

/**
 * Shared clipboard copy + positive notify shape for action-manager handlers.
 */
export function createFaActionClipboardCopyResolvedText (deps: {
  copyToClipboard: (text: string) => Promise<void>
  i18n: {
    global: {
      t: (key: string) => string
    }
  }
  notifyCreate: (options: {
    color?: string
    faSkipNotifyConsoleLog?: boolean
    icon?: string
    message: string
    timeout?: number
    type: string
  }) => void
}): {
    copyResolvedText: (
      copyText: string,
      successMessageKey: string
    ) => Promise<T_faActionHandlerContinuation>
  } {
  function notifyClipboardCopySuccess (messageKey: string): void {
    deps.notifyCreate({
      color: 'positive',
      faSkipNotifyConsoleLog: true,
      icon: 'mdi-clipboard-check-outline',
      message: deps.i18n.global.t(messageKey),
      timeout: 2500,
      type: 'positive'
    })
  }

  async function copyResolvedText (
    copyText: string,
    successMessageKey: string
  ): Promise<T_faActionHandlerContinuation> {
    await deps.copyToClipboard(copyText)
    notifyClipboardCopySuccess(successMessageKey)
    return { payloadPreview: copyText }
  }

  return {
    copyResolvedText
  }
}
