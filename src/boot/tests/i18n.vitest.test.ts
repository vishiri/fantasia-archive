import { expect, test, vi } from 'vitest'

const {
  bootMock,
  createI18nMock,
  i18nInstanceMock
} = vi.hoisted(() => {
  const bootImplementation = vi.fn((callback: unknown) => callback)
  const i18nInstance = { id: 'i18n-instance' }

  return {
    bootMock: bootImplementation,
    createI18nMock: vi.fn(() => i18nInstance),
    i18nInstanceMock: i18nInstance
  }
})

vi.mock('#q-app/wrappers', () => {
  return {
    defineBoot: bootMock
  }
})

vi.mock('vue-i18n', () => {
  return {
    createI18n: createI18nMock
  }
})

vi.mock('src/i18n', () => {
  return {
    default: {
      'en-US': {
        app: {
          name: 'Fantasia Archive'
        }
      }
    }
  }
})

import i18nBootFunction from '../i18n'

/**
 * i18n boot file
 * Test if app registers created i18n plugin.
 */
test('Test that i18n boot creates i18n and registers it on the app instance', () => {
  const appUseMock = vi.fn()

  i18nBootFunction({
    app: {
      use: appUseMock
    }
  } as never)

  expect(createI18nMock).toHaveBeenCalledOnce()
  expect(createI18nMock).toHaveBeenCalledWith(expect.objectContaining({
    locale: 'en-US',
    fallbackLocale: 'en-US',
    legacy: false,
    warnHtmlMessage: false
  }))
  expect(appUseMock).toHaveBeenCalledWith(i18nInstanceMock)
})
