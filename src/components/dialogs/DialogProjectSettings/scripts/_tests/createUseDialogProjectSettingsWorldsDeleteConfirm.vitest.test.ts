import { computed, effectScope, nextTick, ref, watch } from 'vue'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'

import { createUseDialogProjectSettingsWorldsDeleteConfirm } from '../functions/createUseDialogProjectSettingsWorldsDeleteConfirm'

const confirmDelaySec = 5

function createTestUseDialogProjectSettingsWorldsDeleteConfirm (): {
  api: ReturnType<ReturnType<typeof createUseDialogProjectSettingsWorldsDeleteConfirm>>
  runUnmountHooks: () => void
} {
  const unmountHooks: Array<() => void> = []
  const useConfirm = createUseDialogProjectSettingsWorldsDeleteConfirm({
    clearInterval: (handle) => {
      clearInterval(handle)
    },
    computed,
    confirmDelaySec,
    onUnmounted: (hook) => {
      unmountHooks.push(hook)
    },
    ref,
    setInterval: (handler, timeout) => {
      return setInterval(handler, timeout)
    },
    watch: (source, callback) => {
      watch(source, callback)
    }
  })

  const scope = effectScope()
  const api = scope.run(() => useConfirm())
  if (api === undefined) {
    throw new Error('Expected delete confirm composable scope to return API')
  }

  return {
    api,
    runUnmountHooks (): void {
      for (const hook of unmountHooks) {
        hook()
      }
      scope.stop()
    }
  }
}

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

/**
 * createUseDialogProjectSettingsWorldsDeleteConfirm
 * Counts down from the configured delay and enables confirm when it reaches zero.
 */
test('Test that createUseDialogProjectSettingsWorldsDeleteConfirm counts down and enables confirm', () => {
  const { api, runUnmountHooks } = createTestUseDialogProjectSettingsWorldsDeleteConfirm()

  api.onMenuShow()
  expect(api.secondsRemaining.value).toBe(confirmDelaySec)
  expect(api.confirmDeleteDisabled.value).toBe(true)

  vi.advanceTimersByTime(1000)
  expect(api.secondsRemaining.value).toBe(4)

  vi.advanceTimersByTime(4000)
  expect(api.secondsRemaining.value).toBe(0)
  expect(api.confirmDeleteDisabled.value).toBe(false)

  const onConfirm = vi.fn()
  api.onConfirmDelete(onConfirm)
  expect(onConfirm).toHaveBeenCalledTimes(1)
  expect(api.menuOpen.value).toBe(false)

  runUnmountHooks()
})

/**
 * createUseDialogProjectSettingsWorldsDeleteConfirm
 * Ignores confirm while the countdown is still active and resets on hide.
 */
test('Test that createUseDialogProjectSettingsWorldsDeleteConfirm blocks early confirm and resets on hide', () => {
  const { api, runUnmountHooks } = createTestUseDialogProjectSettingsWorldsDeleteConfirm()

  api.onMenuShow()
  const onConfirm = vi.fn()
  api.onConfirmDelete(onConfirm)
  expect(onConfirm).not.toHaveBeenCalled()

  api.onMenuHide()
  expect(api.secondsRemaining.value).toBe(confirmDelaySec)

  runUnmountHooks()
})

/**
 * createUseDialogProjectSettingsWorldsDeleteConfirm
 * Starts the countdown when menuOpen becomes true.
 */
test('Test that createUseDialogProjectSettingsWorldsDeleteConfirm starts countdown when menu opens', async () => {
  const { api, runUnmountHooks } = createTestUseDialogProjectSettingsWorldsDeleteConfirm()

  api.menuOpen.value = true
  await nextTick()
  expect(api.secondsRemaining.value).toBe(confirmDelaySec)

  vi.advanceTimersByTime(1000)
  expect(api.secondsRemaining.value).toBe(4)

  runUnmountHooks()
})

/**
 * createUseDialogProjectSettingsWorldsDeleteConfirm
 * closeMenu sets menuOpen to false.
 */
test('Test that createUseDialogProjectSettingsWorldsDeleteConfirm closeMenu dismisses the menu', () => {
  const { api, runUnmountHooks } = createTestUseDialogProjectSettingsWorldsDeleteConfirm()

  api.menuOpen.value = true
  api.closeMenu()
  expect(api.menuOpen.value).toBe(false)

  runUnmountHooks()
})

/**
 * createUseDialogProjectSettingsWorldsDeleteConfirm
 * Resets countdown when menuOpen becomes false via watch.
 */
test('Test that createUseDialogProjectSettingsWorldsDeleteConfirm resets countdown when menu closes', async () => {
  const { api, runUnmountHooks } = createTestUseDialogProjectSettingsWorldsDeleteConfirm()

  api.menuOpen.value = true
  await nextTick()
  vi.advanceTimersByTime(2000)
  api.menuOpen.value = false
  await nextTick()
  expect(api.secondsRemaining.value).toBe(confirmDelaySec)

  runUnmountHooks()
})
