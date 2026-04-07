import { expect, test } from 'vitest'

import messages from 'app/i18n'
import { i18n } from 'app/i18n/externalFileLoader'

/**
 * Ensures the locale registry and standalone i18n instance load (drives **unit-i18n** coverage for **index.ts** and **externalFileLoader.ts**).
 */
test('locale registry exposes en-US, de, and fr', () => {
  expect(messages['en-US']).toBeDefined()
  expect(messages.de).toBeDefined()
  expect(messages.fr).toBeDefined()
})

/**
 * **externalFileLoader** exposes a vue-i18n instance for Pinia and non-boot scripts.
 */
test('externalFileLoader exposes i18n global API', () => {
  expect(i18n.global.t('dialogs.programSettings.title')).toBeTruthy()
  expect(i18n.global.t('dialogs.programSettings.settingsSearchPlaceholder')).toBeTruthy()
})
