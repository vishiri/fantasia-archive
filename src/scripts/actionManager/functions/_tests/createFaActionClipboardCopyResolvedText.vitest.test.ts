import { expect, test, vi } from 'vitest'

import { createFaActionClipboardCopyResolvedText } from '../createFaActionClipboardCopyResolvedText'

/**
 * createFaActionClipboardCopyResolvedText
 * Copies text then emits shared positive clipboard notify.
 */
test('Test that createFaActionClipboardCopyResolvedText copies and notifies success', async () => {
  const copyToClipboard = vi.fn(async () => undefined)
  const notifyCreate = vi.fn()
  const t = vi.fn((key: string) => `translated:${key}`)
  const { copyResolvedText } = createFaActionClipboardCopyResolvedText({
    copyToClipboard,
    i18n: {
      global: {
        t
      }
    },
    notifyCreate
  })

  const continuation = await copyResolvedText(
    'copied-value',
    'projectUI.projectAppControlBar.copyNameSuccess'
  )

  expect(copyToClipboard).toHaveBeenCalledWith('copied-value')
  expect(t).toHaveBeenCalledWith('projectUI.projectAppControlBar.copyNameSuccess')
  expect(notifyCreate).toHaveBeenCalledWith({
    color: 'positive',
    faSkipNotifyConsoleLog: true,
    icon: 'mdi-clipboard-check-outline',
    message: 'translated:projectUI.projectAppControlBar.copyNameSuccess',
    timeout: 2500,
    type: 'positive'
  })
  expect(continuation).toEqual({ payloadPreview: 'copied-value' })
})
