import type { BrowserWindow, WebContents } from 'electron'
import { afterEach, expect, test } from 'vitest'

import { assertMainWindowSender } from '../assertMainWindowSenderWiring'
import { assignAppWindowRefForTesting } from '../../windowManagement/mainWindowCreationWiring'

afterEach(() => {
  assignAppWindowRefForTesting(undefined)
})

/**
 * assertMainWindowSenderWiring
 * Rejects when no main window is assigned.
 */
test('Test that assertMainWindowSender returns false when appWindow is undefined', () => {
  assignAppWindowRefForTesting(undefined)
  expect(assertMainWindowSender({ id: 1 } as WebContents)).toBe(false)
})

/**
 * assertMainWindowSenderWiring
 * Rejects when the main window is destroyed.
 */
test('Test that assertMainWindowSender returns false when appWindow is destroyed', () => {
  assignAppWindowRefForTesting({
    isDestroyed: () => true,
    webContents: {
      id: 7,
      isDestroyed: () => false
    }
  } as unknown as BrowserWindow)
  expect(assertMainWindowSender({ id: 7 } as WebContents)).toBe(false)
})

/**
 * assertMainWindowSenderWiring
 * Rejects when main webContents is destroyed.
 */
test('Test that assertMainWindowSender returns false when webContents is destroyed', () => {
  assignAppWindowRefForTesting({
    isDestroyed: () => false,
    webContents: {
      id: 7,
      isDestroyed: () => true
    }
  } as unknown as BrowserWindow)
  expect(assertMainWindowSender({ id: 7 } as WebContents)).toBe(false)
})

/**
 * assertMainWindowSenderWiring
 * Accepts the live main window sender.
 */
test('Test that assertMainWindowSender returns true for the main webContents sender', () => {
  assignAppWindowRefForTesting({
    isDestroyed: () => false,
    webContents: {
      id: 11,
      isDestroyed: () => false
    }
  } as unknown as BrowserWindow)
  expect(assertMainWindowSender({ id: 11 } as WebContents)).toBe(true)
})

/**
 * assertMainWindowSenderWiring
 * Rejects a foreign webContents id while main window is live.
 */
test('Test that assertMainWindowSender returns false for a foreign sender id', () => {
  assignAppWindowRefForTesting({
    isDestroyed: () => false,
    webContents: {
      id: 11,
      isDestroyed: () => false
    }
  } as unknown as BrowserWindow)
  expect(assertMainWindowSender({ id: 99 } as WebContents)).toBe(false)
})
