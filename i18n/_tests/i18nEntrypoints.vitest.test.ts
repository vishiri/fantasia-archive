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

test('de and fr include core keys aligned with en-US (error page, window buttons, did-you-know)', () => {
  expect((messages.de as { errorNotFound: { title: string } }).errorNotFound?.title).toBeTruthy()
  expect((messages.fr as { errorNotFound: { title: string } }).errorNotFound?.title).toBeTruthy()
  expect((messages.de as { globalWindowButtons: { close: string } }).globalWindowButtons?.close).toBeTruthy()
  expect((messages.fr as { globalWindowButtons: { close: string } }).globalWindowButtons?.close).toBeTruthy()
  expect(
    (messages.de as { globalFunctionality: { unsortedAppTexts: { didYouKnow: string } } }).globalFunctionality
      .unsortedAppTexts.didYouKnow
  ).toBeTruthy()
  expect(
    (messages.fr as { globalFunctionality: { unsortedAppTexts: { didYouKnow: string } } }).globalFunctionality
      .unsortedAppTexts.didYouKnow
  ).toBeTruthy()
})

/**
 * **externalFileLoader** exposes a vue-i18n instance for Pinia and non-boot scripts.
 */
test('externalFileLoader exposes i18n global API', () => {
  expect(i18n.global.t('mainLayout.drawer.essentialLinksHeader')).toBeTruthy()
  expect(i18n.global.t('dialogs.programSettings.title')).toBeTruthy()
  expect(i18n.global.t('dialogs.programSettings.settingsSearchPlaceholder')).toBeTruthy()
  expect(i18n.global.t('dialogs.programSettings.searchNoResultsTitle')).toBeTruthy()
  expect(i18n.global.t('dialogs.programSettings.searchNoResultsDescription')).toBeTruthy()
  expect(i18n.global.t('dialogs.keybindSettings.filterNoResultsTitle')).toBeTruthy()
  expect(i18n.global.t('dialogs.keybindSettings.filterNoResultsDescription')).toBeTruthy()
  expect(i18n.global.t('floatingWindows.programStyling.title')).toBeTruthy()
  expect(i18n.global.t('globalFunctionality.faProgramStyling.saveSuccess')).toBeTruthy()
})
