import { expect, test, vi } from 'vitest'

import { useGlobalLanguageSelectorSpellcheckRefresh } from '../useGlobalLanguageSelectorSpellcheckRefresh'

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
 * Invokes the window control bridge and hides the hint.
 */
test('Test that refreshWebContentsAndHide invokes faWindowControl.refreshWebContents', async () => {
  const refreshWebContents = vi.fn(async () => undefined)
  window.faContentBridgeAPIs = {
    ...window.faContentBridgeAPIs,
    faWindowControl: {
      ...window.faContentBridgeAPIs.faWindowControl,
      refreshWebContents
    }
  }

  const {
    noteLanguageApplied,
    refreshWebContentsAndHide,
    showSpellcheckRefresh
  } = useGlobalLanguageSelectorSpellcheckRefresh()

  noteLanguageApplied('en-US', 'fr')
  expect(showSpellcheckRefresh.value).toBe(true)

  await refreshWebContentsAndHide()

  expect(refreshWebContents).toHaveBeenCalledOnce()
  expect(showSpellcheckRefresh.value).toBe(false)
})

test('Test that refreshWebContentsAndHide clears the hint when refreshWebContents is absent', async () => {
  window.faContentBridgeAPIs = {
    ...window.faContentBridgeAPIs,
    faWindowControl: {
      checkWindowMaximized: async () => false,
      closeWindow: async () => undefined,
      maximizeWindow: async () => undefined,
      minimizeWindow: async () => undefined,
      refreshWebContents: undefined as unknown as () => Promise<void>,
      resizeWindow: async () => undefined
    }
  }

  const {
    noteLanguageApplied,
    refreshWebContentsAndHide,
    showSpellcheckRefresh
  } = useGlobalLanguageSelectorSpellcheckRefresh()

  noteLanguageApplied('en-US', 'de')
  await refreshWebContentsAndHide()

  expect(showSpellcheckRefresh.value).toBe(false)
})
