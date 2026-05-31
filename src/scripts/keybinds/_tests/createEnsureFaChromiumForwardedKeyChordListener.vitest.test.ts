import { expect, test, vi } from 'vitest'

import { createEnsureFaChromiumForwardedKeyChordListener } from '../functions/createEnsureFaChromiumForwardedKeyChordListener'

test('createEnsureFaChromiumForwardedKeyChordListener installs once when bridge exists', () => {
  const installForwardedKeyChordListener = vi.fn()
  const dispatchForwardedKeyChord = vi.fn()
  let installed = false
  const ensure = createEnsureFaChromiumForwardedKeyChordListener({
    dispatchForwardedKeyChord,
    getListenerAlreadyInstalled: () => installed,
    hasChromiumCtrlShiftShortcutBridge: () => true,
    installForwardedKeyChordListener,
    markListenerInstalled: () => {
      installed = true
    }
  })

  ensure()
  ensure()

  expect(installForwardedKeyChordListener).toHaveBeenCalledOnce()
  const handler = installForwardedKeyChordListener.mock.calls[0][0] as (payload: {
    code: string
  }) => void
  handler({
    code: 'KeyO'
  })
  expect(dispatchForwardedKeyChord).toHaveBeenCalledWith({
    code: 'KeyO'
  })
})

test('createEnsureFaChromiumForwardedKeyChordListener skips when bridge is missing', () => {
  const installForwardedKeyChordListener = vi.fn()
  const ensure = createEnsureFaChromiumForwardedKeyChordListener({
    dispatchForwardedKeyChord: vi.fn(),
    getListenerAlreadyInstalled: () => false,
    hasChromiumCtrlShiftShortcutBridge: () => false,
    installForwardedKeyChordListener,
    markListenerInstalled: vi.fn()
  })

  ensure()

  expect(installForwardedKeyChordListener).not.toHaveBeenCalled()
})
