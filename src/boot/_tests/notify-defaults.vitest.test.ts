import { expect, test, vi } from 'vitest'

const {
  notifyCreateMock,
  notifySetDefaultsMock
} = vi.hoisted(() => {
  return {
    notifyCreateMock: vi.fn(() => (): void => {}),
    notifySetDefaultsMock: vi.fn()
  }
})

vi.mock('quasar', () => {
  return {
    Notify: {
      create: notifyCreateMock,
      setDefaults: notifySetDefaultsMock
    }
  }
})

/**
 * notify-defaults boot side effect
 * Test if Notify defaults are configured on module import.
 */
test('Test that notify-defaults configures expected Quasar Notify defaults', async () => {
  notifyCreateMock.mockClear()
  notifySetDefaultsMock.mockClear()
  await import('../notify-defaults')

  expect(notifySetDefaultsMock).toHaveBeenCalledOnce()
  expect(notifySetDefaultsMock).toHaveBeenCalledWith({
    position: 'bottom-right',
    progress: true,
    timeout: 4000
  })
})
