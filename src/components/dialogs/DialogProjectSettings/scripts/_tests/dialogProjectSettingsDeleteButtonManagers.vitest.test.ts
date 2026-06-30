/** @vitest-environment jsdom */
import { afterEach, beforeEach, expect, test, vi } from 'vitest'

import { useDialogProjectSettingsDocumentTemplatesDeleteConfirm } from '../dialogProjectSettingsDocumentTemplatesDeleteButton_manager'
import { useDialogProjectSettingsWorldsDeleteConfirm } from '../dialogProjectSettingsWorldsDeleteButton_manager'
import { FA_DIALOG_PROJECT_SETTINGS_WORLD_DELETE_CONFIRM_DELAY_SEC } from 'app/types/I_dialogProjectSettingsWorlds'

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

/**
 * useDialogProjectSettingsDocumentTemplatesDeleteConfirm exposes delete menu state.
 */
test('Test that document templates delete confirm manager exposes menu state', () => {
  const api = useDialogProjectSettingsDocumentTemplatesDeleteConfirm()
  expect(api.menuOpen.value).toBe(false)
  expect(api.confirmDeleteDisabled.value).toBe(true)
  api.onMenuShow()
  vi.advanceTimersByTime(1000)
  expect(api.secondsRemaining.value).toBeLessThan(5)
  api.onMenuHide()
})

/**
 * useDialogProjectSettingsWorldsDeleteConfirm exposes delete menu state.
 */
test('Test that worlds delete confirm manager exposes menu state', () => {
  const api = useDialogProjectSettingsWorldsDeleteConfirm()
  expect(api.menuOpen.value).toBe(false)
  expect(api.confirmDeleteDisabled.value).toBe(true)
  api.onMenuShow()
  vi.advanceTimersByTime(1000)
  expect(api.secondsRemaining.value).toBe(
    FA_DIALOG_PROJECT_SETTINGS_WORLD_DELETE_CONFIRM_DELAY_SEC - 1
  )
  api.onMenuHide()
})
