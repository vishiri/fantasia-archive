import { expect, test } from 'vitest'

import {
  FA_PLAYWRIGHT_PRESS_ADJUSTED_TOGGLE_DEVTOOLS_F12,
  FA_PLAYWRIGHT_PRESS_CONTROL_SHIFT_F11,
  FA_PLAYWRIGHT_PRESS_CONTROL_SHIFT_F12,
  getFaPlaywrightDefaultActionMonitorOpenPressString,
  getFaPlaywrightDefaultToggleDevtoolsPressString,
  getFaPlaywrightMonacoSelectAllPressString
} from '../faPlaywrightKeyboardChords'

test('getFaPlaywrightDefaultToggleDevtoolsPressString is Meta+F12 on darwin', () => {
  expect(getFaPlaywrightDefaultToggleDevtoolsPressString('darwin')).toBe('Meta+F12')
})

test('getFaPlaywrightDefaultToggleDevtoolsPressString is Control+F12 on win32', () => {
  expect(getFaPlaywrightDefaultToggleDevtoolsPressString('win32')).toBe('Control+F12')
})

test('getFaPlaywrightDefaultToggleDevtoolsPressString is Control+F12 on linux', () => {
  expect(getFaPlaywrightDefaultToggleDevtoolsPressString('linux')).toBe('Control+F12')
})

test('getFaPlaywrightDefaultActionMonitorOpenPressString is Meta+F11 on darwin', () => {
  expect(getFaPlaywrightDefaultActionMonitorOpenPressString('darwin')).toBe('Meta+F11')
})

test('getFaPlaywrightDefaultActionMonitorOpenPressString is Control+F11 on win32', () => {
  expect(getFaPlaywrightDefaultActionMonitorOpenPressString('win32')).toBe('Control+F11')
})

test('getFaPlaywrightMonacoSelectAllPressString is Meta+A on darwin', () => {
  expect(getFaPlaywrightMonacoSelectAllPressString('darwin')).toBe('Meta+A')
})

test('getFaPlaywrightMonacoSelectAllPressString is Control+A on win32', () => {
  expect(getFaPlaywrightMonacoSelectAllPressString('win32')).toBe('Control+A')
})

test('FA_PLAYWRIGHT_PRESS_CONTROL_SHIFT_F12 is a stable cross-OS literal', () => {
  expect(FA_PLAYWRIGHT_PRESS_CONTROL_SHIFT_F12).toBe('Control+Shift+F12')
})

test('FA_PLAYWRIGHT_PRESS_CONTROL_SHIFT_F11 is a stable cross-OS literal', () => {
  expect(FA_PLAYWRIGHT_PRESS_CONTROL_SHIFT_F11).toBe('Control+Shift+F11')
})

test('FA_PLAYWRIGHT_PRESS_ADJUSTED_TOGGLE_DEVTOOLS_F12 matches keybinds E2E suite', () => {
  expect(FA_PLAYWRIGHT_PRESS_ADJUSTED_TOGGLE_DEVTOOLS_F12).toBe('Control+Alt+Shift+F12')
})
