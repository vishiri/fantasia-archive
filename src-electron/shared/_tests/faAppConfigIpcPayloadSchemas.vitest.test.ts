import { expect, test } from 'vitest'

import {
  parseFaAppConfigApplyInput,
  parseFaAppConfigExportOptions
} from '../faAppConfigIpcPayloadSchemas'

/**
 * parseFaAppConfigExportOptions
 * Rejects non-objects and payloads without boolean include flags.
 */
test('Test that parseFaAppConfigExportOptions validates export payloads', () => {
  expect(() => parseFaAppConfigExportOptions(null)).toThrow('export options must be an object')
  expect(() => parseFaAppConfigExportOptions({
    includeKeybinds: true,
    includeAppNoteboard: false,
    includeAppSettings: false,
    includeAppStyling: false
  })).not.toThrow()
  expect(() => parseFaAppConfigExportOptions({
    includeKeybinds: false,
    includeAppNoteboard: false,
    includeAppSettings: false,
    includeAppStyling: false
  })).toThrow('at least one include flag is required')
})

/**
 * parseFaAppConfigApplyInput
 * Requires session id and boolean apply flags.
 */
test('Test that parseFaAppConfigApplyInput validates apply payloads', () => {
  expect(() => parseFaAppConfigApplyInput(null)).toThrow('applyImport: expected object')
  expect(parseFaAppConfigApplyInput({
    applyKeybinds: true,
    applyAppNoteboard: false,
    applyAppSettings: true,
    applyAppStyling: false,
    sessionId: 'abc'
  })).toEqual({
    applyKeybinds: true,
    applyAppNoteboard: false,
    applyAppSettings: true,
    applyAppStyling: false,
    sessionId: 'abc'
  })
})
