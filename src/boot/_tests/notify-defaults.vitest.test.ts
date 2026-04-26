import { expect, test, vi } from 'vitest'

const { notifySetDefaultsMock } = vi.hoisted(() => {
  return {
    notifySetDefaultsMock: vi.fn()
  }
})

vi.mock('quasar', () => {
  return {
    Notify: {
      setDefaults: notifySetDefaultsMock
    }
  }
})

/**
 * notify-defaults boot side effect
 * Test if Notify defaults are configured on module import.
 */
test('Test that notify-defaults configures expected Quasar Notify defaults', async () => {
  await import('../notify-defaults')

  expect(notifySetDefaultsMock).toHaveBeenCalledOnce()
  expect(notifySetDefaultsMock).toHaveBeenCalledWith({
    position: 'bottom-right',
    progress: true,
    timeout: 4000
  })
})
