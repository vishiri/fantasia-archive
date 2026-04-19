import { beforeEach, expect, test, vi } from 'vitest'

const { runFaActionAwaitMock } = vi.hoisted(() => ({
  runFaActionAwaitMock: vi.fn(async () => true)
}))

vi.mock('app/src/scripts/actionManager/faActionManagerRun', () => ({
  runFaAction: vi.fn(),
  runFaActionAwait: runFaActionAwaitMock
}))

import { useGlobalLanguageSelectorSpellcheckRefresh } from '../useGlobalLanguageSelectorSpellcheckRefresh'

beforeEach(() => {
  runFaActionAwaitMock.mockReset()
  runFaActionAwaitMock.mockResolvedValue(true)
})

/**
 * useGlobalLanguageSelectorSpellcheckRefresh
 * Shows the hint when the applied language code changes.
 */
test('Test that noteLanguageApplied toggles visibility when the language code changes', () => {
  const {
    noteLanguageApplied,
    showSpellcheckRefresh
  } = useGlobalLanguageSelectorSpellcheckRefresh()

  noteLanguageApplied('en-US', 'de')
  expect(showSpellcheckRefresh.value).toBe(true)
})

test('Test that noteLanguageApplied leaves visibility off when the language code is unchanged', () => {
  const {
    noteLanguageApplied,
    showSpellcheckRefresh
  } = useGlobalLanguageSelectorSpellcheckRefresh()

  noteLanguageApplied('fr', 'fr')
  expect(showSpellcheckRefresh.value).toBe(false)
})

/**
 * useGlobalLanguageSelectorSpellcheckRefresh
 * Dispatches the refreshWebContentsAfterLanguage action and clears the hint.
 */
test('Test that refreshWebContentsAndHide dispatches the refreshWebContentsAfterLanguage action and hides the hint', async () => {
  const {
    noteLanguageApplied,
    refreshWebContentsAndHide,
    showSpellcheckRefresh
  } = useGlobalLanguageSelectorSpellcheckRefresh()

  noteLanguageApplied('en-US', 'fr')
  expect(showSpellcheckRefresh.value).toBe(true)

  await refreshWebContentsAndHide()

  expect(runFaActionAwaitMock).toHaveBeenCalledWith('refreshWebContentsAfterLanguage', undefined)
  expect(showSpellcheckRefresh.value).toBe(false)
})

test('Test that refreshWebContentsAndHide still clears the hint even when the action resolves false', async () => {
  runFaActionAwaitMock.mockReset()
  runFaActionAwaitMock.mockResolvedValueOnce(false)

  const {
    noteLanguageApplied,
    refreshWebContentsAndHide,
    showSpellcheckRefresh
  } = useGlobalLanguageSelectorSpellcheckRefresh()

  noteLanguageApplied('en-US', 'de')
  await refreshWebContentsAndHide()

  expect(showSpellcheckRefresh.value).toBe(false)
})
