import { test, expect } from 'vitest'

import { FA_CHROMIUM_CTRL_SHIFT_SUPPRESS_KEY_CODES } from 'app/types/I_faChromiumCtrlShiftSuppress'

import { resolveFaChromiumCtrlShiftShortcutToForward } from '../resolveFaChromiumCtrlShiftShortcutToForward'

const denylistedDomCodes = new Set<string>(FA_CHROMIUM_CTRL_SHIFT_SUPPRESS_KEY_CODES)

function baseInput (overrides: {
  code?: string
  key?: string
} = {}) {
  return {
    alt: false,
    code: overrides.code ?? 'KeyO',
    control: true,
    key: overrides.key ?? 'o',
    meta: false,
    shift: true,
    type: 'keyDown'
  }
}

test('resolveFaChromiumCtrlShiftShortcutToForward returns each denylisted code', () => {
  for (const code of FA_CHROMIUM_CTRL_SHIFT_SUPPRESS_KEY_CODES) {
    expect(resolveFaChromiumCtrlShiftShortcutToForward(baseInput({
      code,
      key: 'Process'
    }), denylistedDomCodes)).toBe(code)
  }
})

test('resolveFaChromiumCtrlShiftShortcutToForward maps letter key when code is empty on Windows IME', () => {
  expect(resolveFaChromiumCtrlShiftShortcutToForward(baseInput({
    code: '',
    key: 'o'
  }), denylistedDomCodes)).toBe('KeyO')
})

test('resolveFaChromiumCtrlShiftShortcutToForward maps single-letter code O to KeyO', () => {
  expect(resolveFaChromiumCtrlShiftShortcutToForward(baseInput({
    code: 'O',
    key: 'Process'
  }), denylistedDomCodes)).toBe('KeyO')
})

test('resolveFaChromiumCtrlShiftShortcutToForward maps lowercase single-letter code to Key*', () => {
  expect(resolveFaChromiumCtrlShiftShortcutToForward(baseInput({
    code: 'o',
    key: 'Process'
  }), denylistedDomCodes)).toBe('KeyO')
})

test('resolveFaChromiumCtrlShiftShortcutToForward maps Delete from key when code is empty', () => {
  expect(resolveFaChromiumCtrlShiftShortcutToForward(baseInput({
    code: '',
    key: 'Delete'
  }), denylistedDomCodes)).toBe('Delete')
})

test('resolveFaChromiumCtrlShiftShortcutToForward rejects keyUp and non-denylisted keys', () => {
  expect(resolveFaChromiumCtrlShiftShortcutToForward({
    ...baseInput(),
    type: 'keyUp'
  }, denylistedDomCodes)).toBeNull()
  expect(resolveFaChromiumCtrlShiftShortcutToForward(baseInput({
    code: 'KeyA',
    key: 'a'
  }), denylistedDomCodes)).toBeNull()
})

test('resolveFaChromiumCtrlShiftShortcutToForward rejects missing modifiers or extra alt/meta', () => {
  expect(resolveFaChromiumCtrlShiftShortcutToForward({
    ...baseInput(),
    control: false
  }, denylistedDomCodes)).toBeNull()
  expect(resolveFaChromiumCtrlShiftShortcutToForward({
    ...baseInput(),
    shift: false
  }, denylistedDomCodes)).toBeNull()
  expect(resolveFaChromiumCtrlShiftShortcutToForward({
    ...baseInput(),
    alt: true
  }, denylistedDomCodes)).toBeNull()
  expect(resolveFaChromiumCtrlShiftShortcutToForward({
    ...baseInput(),
    meta: true
  }, denylistedDomCodes)).toBeNull()
})
