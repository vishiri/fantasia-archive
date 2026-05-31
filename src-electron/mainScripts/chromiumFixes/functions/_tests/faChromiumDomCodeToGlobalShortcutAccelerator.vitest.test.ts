import { expect, test } from 'vitest'

import { faChromiumDomCodeToGlobalShortcutAccelerator } from '../faChromiumDomCodeToGlobalShortcutAccelerator'

test('faChromiumDomCodeToGlobalShortcutAccelerator maps KeyO and Delete', () => {
  expect(faChromiumDomCodeToGlobalShortcutAccelerator('KeyO')).toBe('CommandOrControl+Shift+O')
  expect(faChromiumDomCodeToGlobalShortcutAccelerator('Delete')).toBe('CommandOrControl+Shift+Delete')
})

test('faChromiumDomCodeToGlobalShortcutAccelerator returns null for unknown codes', () => {
  expect(faChromiumDomCodeToGlobalShortcutAccelerator('KeyA')).toBe('CommandOrControl+Shift+A')
  expect(faChromiumDomCodeToGlobalShortcutAccelerator('')).toBeNull()
})
