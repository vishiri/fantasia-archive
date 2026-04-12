import { expect, test, vi } from 'vitest'

import { applyFaSpellCheckerLanguagesToSession } from '../faSpellCheckerSession'

/**
 * applyFaSpellCheckerLanguagesToSession
 * Sets spellchecker languages when a resolved tag exists.
 */
test('Test that applyFaSpellCheckerLanguagesToSession clears languages then applies resolved tag', () => {
  const setSpellCheckerEnabled = vi.fn()
  const setSpellCheckerLanguages = vi.fn()
  const session = {
    availableSpellCheckerLanguages: ['en-US', 'fr'],
    setSpellCheckerEnabled,
    setSpellCheckerLanguages
  }
  applyFaSpellCheckerLanguagesToSession(session as never, 'fr')
  expect(setSpellCheckerEnabled).toHaveBeenNthCalledWith(1, false)
  expect(setSpellCheckerLanguages).toHaveBeenNthCalledWith(1, [])
  expect(setSpellCheckerLanguages).toHaveBeenNthCalledWith(2, ['fr'])
  expect(setSpellCheckerEnabled).toHaveBeenNthCalledWith(2, true)
})

/**
 * applyFaSpellCheckerLanguagesToSession
 * Skips setSpellCheckerLanguages when available list is empty.
 */
test('Test that applyFaSpellCheckerLanguagesToSession no-ops when no dictionaries are available', () => {
  const setSpellCheckerEnabled = vi.fn()
  const setSpellCheckerLanguages = vi.fn()
  const session = {
    availableSpellCheckerLanguages: [] as string[],
    setSpellCheckerEnabled,
    setSpellCheckerLanguages
  }
  applyFaSpellCheckerLanguagesToSession(session as never, 'de')
  expect(setSpellCheckerLanguages).not.toHaveBeenCalled()
  expect(setSpellCheckerEnabled).not.toHaveBeenCalled()
})

/**
 * applyFaSpellCheckerLanguagesToSession
 * Swallows Chromium errors when the session rejects a language tag.
 */
test('Test that applyFaSpellCheckerLanguagesToSession does not throw when setSpellCheckerLanguages fails', () => {
  const setSpellCheckerEnabled = vi.fn()
  const setSpellCheckerLanguages = vi.fn(() => {
    throw new Error('invalid language')
  })
  const session = {
    availableSpellCheckerLanguages: ['en-US'],
    setSpellCheckerEnabled,
    setSpellCheckerLanguages
  }
  expect(() => {
    applyFaSpellCheckerLanguagesToSession(session as never, 'fr')
  }).not.toThrow()
})

/**
 * applyFaSpellCheckerLanguagesToSession
 * Uses bare fr when resolver returns null and applies without throwing.
 */
test('Test that applyFaSpellCheckerLanguagesToSession uses languageCode when resolver returns null', () => {
  const setSpellCheckerEnabled = vi.fn()
  const setSpellCheckerLanguages = vi.fn()
  const session = {
    availableSpellCheckerLanguages: ['en-US', 'pl'],
    setSpellCheckerEnabled,
    setSpellCheckerLanguages
  }
  applyFaSpellCheckerLanguagesToSession(session as never, 'fr')
  expect(setSpellCheckerLanguages).toHaveBeenNthCalledWith(2, ['fr'])
})

/**
 * applyFaSpellCheckerLanguagesToSession
 * Skips apply when en-US cannot be resolved and no tag is used.
 */
test('Test that applyFaSpellCheckerLanguagesToSession returns when en-US resolves to null', () => {
  const setSpellCheckerEnabled = vi.fn()
  const setSpellCheckerLanguages = vi.fn()
  const session = {
    availableSpellCheckerLanguages: new Array(2),
    setSpellCheckerEnabled,
    setSpellCheckerLanguages
  }
  applyFaSpellCheckerLanguagesToSession(session as never, 'en-US')
  expect(setSpellCheckerLanguages).not.toHaveBeenCalled()
})
