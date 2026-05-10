import { test, expect } from 'vitest'

import { FA_USER_SETTINGS_DEFAULTS } from 'app/src-electron/mainScripts/userSettings/faUserSettingsDefaults'
import {
  parseFaKeybindsRootFile,
  parseFaAppNoteboardRootFile,
  parseFaAppStylingRootFile,
  parseFaUserSettingsFile
} from 'app/src-electron/shared/faAppConfigFileSchema'

/**
 * faUserSettingsFileSchema
 * Accepts a full user settings object matching defaults shape.
 */
test('Test that parseFaUserSettingsFile accepts a valid full settings file', () => {
  const v = parseFaUserSettingsFile({ ...FA_USER_SETTINGS_DEFAULTS })
  expect(v.languageCode).toBe('en-US')
})

/**
 * faKeybindsRootFileSchema
 * Accepts schemaVersion and overrides with known command id.
 */
test('Test that parseFaKeybindsRootFile accepts a minimal keybinds root', () => {
  const v = parseFaKeybindsRootFile({
    overrides: {
      openAppSettings: {
        code: 'KeyP',
        mods: ['ctrl']
      }
    },
    schemaVersion: 1
  })
  expect(v.schemaVersion).toBe(1)
})

/**
 * faAppStylingRootFileSchema
 * Enforces max css length via shared bound.
 */
test('Test that parseFaAppStylingRootFile normalizes a valid root', () => {
  const v = parseFaAppStylingRootFile({
    css: 'body { margin:0 }',
    schemaVersion: 1
  })
  expect(v.css).toBe('body { margin:0 }')
  expect(v.frame).toBeNull()
  expect(v.schemaVersion).toBe(1)
})

/**
 * faAppStylingRootFileSchema
 * Preserves an optional frame object.
 */
test('Test that parseFaAppStylingRootFile preserves frame when present', () => {
  const v = parseFaAppStylingRootFile({
    css: 'body { margin:0 }',
    frame: {
      height: 400,
      width: 400,
      x: 1,
      y: 2
    },
    schemaVersion: 1
  })
  expect(v.frame).toEqual({
    height: 400,
    width: 400,
    x: 1,
    y: 2
  })
})

test('Test that parseFaAppNoteboardRootFile maps missing frame to null', () => {
  const v = parseFaAppNoteboardRootFile({
    schemaVersion: 1,
    text: 'hello'
  })
  expect(v.frame).toBeNull()
  expect(v.text).toBe('hello')
})

test('Test that parseFaAppNoteboardRootFile preserves an explicit null frame', () => {
  const v = parseFaAppNoteboardRootFile({
    frame: null,
    schemaVersion: 1,
    text: ''
  })
  expect(v.frame).toBeNull()
})

test('Test that parseFaAppNoteboardRootFile preserves a frame rect', () => {
  const v = parseFaAppNoteboardRootFile({
    frame: {
      height: 120,
      width: 340,
      x: 3,
      y: 4
    },
    schemaVersion: 1,
    text: 'x'
  })
  expect(v.frame).toEqual({
    height: 120,
    width: 340,
    x: 3,
    y: 4
  })
})
