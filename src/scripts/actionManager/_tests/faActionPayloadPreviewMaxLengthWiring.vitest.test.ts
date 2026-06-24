/** @vitest-environment jsdom */
import { beforeEach, expect, test } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

import { FA_USER_SETTINGS_DEFAULTS } from 'app/src-electron/mainScripts/userSettings/faUserSettingsDefaults'
import { S_FaUserSettings } from 'app/src/stores/S_FaUserSettings'

import { FA_ACTION_PAYLOAD_PREVIEW_MAX_LENGTH } from '../functions/faActionPayloadPreviewLimits'
import { resolveFaActionPayloadPreviewMaxLength } from '../faActionPayloadPreviewMaxLengthWiring'

beforeEach(() => {
  setActivePinia(createPinia())
})

/**
 * resolveFaActionPayloadPreviewMaxLength
 * Returns the default preview cap when full payload logging is disabled.
 */
test('Test that resolveFaActionPayloadPreviewMaxLength returns 400 when logging is off', () => {
  S_FaUserSettings().settings = {
    ...FA_USER_SETTINGS_DEFAULTS,
    logFullActivityPayload: false
  }
  expect(resolveFaActionPayloadPreviewMaxLength()).toBe(FA_ACTION_PAYLOAD_PREVIEW_MAX_LENGTH)
})

/**
 * resolveFaActionPayloadPreviewMaxLength
 * Returns no practical cap when Fantasia Archive Settings enables full payload logging.
 */
test('Test that resolveFaActionPayloadPreviewMaxLength returns Infinity when logging is on', () => {
  S_FaUserSettings().settings = {
    ...FA_USER_SETTINGS_DEFAULTS,
    logFullActivityPayload: true
  }
  expect(resolveFaActionPayloadPreviewMaxLength()).toBe(Number.POSITIVE_INFINITY)
})

/**
 * resolveFaActionPayloadPreviewMaxLength
 * Falls back to the default cap when settings have not been loaded yet.
 */
test('Test that resolveFaActionPayloadPreviewMaxLength falls back when settings are null', () => {
  S_FaUserSettings().settings = null
  expect(resolveFaActionPayloadPreviewMaxLength()).toBe(FA_ACTION_PAYLOAD_PREVIEW_MAX_LENGTH)
})
