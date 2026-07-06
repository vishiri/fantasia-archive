import { afterEach, expect, test } from 'vitest'

import {
  faAppHeaderChromeSpellcheckRefreshVisible,
  syncFaAppHeaderChromeSpellcheckRefreshVisible
} from '../faAppHeaderChromeSpellcheckReserveWiring'

afterEach(() => {
  faAppHeaderChromeSpellcheckRefreshVisible.value = false
})

test('Test that syncFaAppHeaderChromeSpellcheckRefreshVisible sets the shared reserve ref when visible', () => {
  syncFaAppHeaderChromeSpellcheckRefreshVisible(true)

  expect(faAppHeaderChromeSpellcheckRefreshVisible.value).toBe(true)
})

test('Test that syncFaAppHeaderChromeSpellcheckRefreshVisible clears the shared reserve ref when hidden', () => {
  faAppHeaderChromeSpellcheckRefreshVisible.value = true

  syncFaAppHeaderChromeSpellcheckRefreshVisible(false)

  expect(faAppHeaderChromeSpellcheckRefreshVisible.value).toBe(false)
})
