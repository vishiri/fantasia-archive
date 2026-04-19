import { beforeEach, expect, test, vi } from 'vitest'

import type { I_faActionHistoryEntry } from 'app/types/I_faActionManagerDomain'

const { copyToClipboardMock, notifyCreateMock } = vi.hoisted(() => ({
  copyToClipboardMock: vi.fn(),
  notifyCreateMock: vi.fn()
}))

vi.mock('quasar', () => ({
  copyToClipboard: copyToClipboardMock,
  Notify: { create: notifyCreateMock }
}))

vi.mock('app/i18n/externalFileLoader', () => ({
  i18n: { global: { t: (key: string) => key } }
}))

import { copyDialogActionMonitorRowToClipboard } from '../dialogActionMonitorRowClipboard'

const buildRow = (overrides: Partial<I_faActionHistoryEntry> = {}): I_faActionHistoryEntry => ({
  enqueuedAt: 1_700_000_000_000,
  id: 'languageSwitch',
  kind: 'async',
  payloadPreview: '{"code":"de"}',
  status: 'success',
  uid: 'uid-success',
  ...overrides
})

beforeEach(() => {
  copyToClipboardMock.mockReset()
  notifyCreateMock.mockReset()
})

/**
 * copyDialogActionMonitorRowToClipboard
 * Should write JSON via copyToClipboard and emit a positive Notify with the row id as the message.
 */
test('Test that copyDialogActionMonitorRowToClipboard copies JSON and emits a positive notification', async () => {
  copyToClipboardMock.mockResolvedValueOnce(undefined)
  await copyDialogActionMonitorRowToClipboard(buildRow())
  expect(copyToClipboardMock).toHaveBeenCalledOnce()
  const copiedPayload = copyToClipboardMock.mock.calls[0]?.[0] as string
  expect(typeof copiedPayload).toBe('string')
  const parsed = JSON.parse(copiedPayload) as Record<string, unknown>
  expect(parsed.id).toBe('languageSwitch')
  expect(notifyCreateMock).toHaveBeenCalledWith(
    expect.objectContaining({
      message: 'languageSwitch',
      type: 'positive'
    })
  )
})

test('Test that copyDialogActionMonitorRowToClipboard emits a negative notification when copy rejects with an Error', async () => {
  copyToClipboardMock.mockRejectedValueOnce(new Error('clipboard offline'))
  const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  await copyDialogActionMonitorRowToClipboard(buildRow())
  expect(notifyCreateMock).toHaveBeenCalledWith(
    expect.objectContaining({
      caption: 'clipboard offline',
      type: 'negative'
    })
  )
  expect(consoleErrorSpy).toHaveBeenCalled()
  consoleErrorSpy.mockRestore()
})

test('Test that copyDialogActionMonitorRowToClipboard wraps non-Error rejections via String() before notifying', async () => {
  copyToClipboardMock.mockRejectedValueOnce('plain reason')
  const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  await copyDialogActionMonitorRowToClipboard(buildRow())
  expect(notifyCreateMock).toHaveBeenCalledWith(
    expect.objectContaining({
      caption: 'plain reason',
      type: 'negative'
    })
  )
  consoleErrorSpy.mockRestore()
})
